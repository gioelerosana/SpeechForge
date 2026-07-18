//! System accent color integration for Material You dynamic theming.
//!
//! On Linux the accent color is read from the XDG Desktop Portal
//! (`org.freedesktop.appearance accent-color`), with a fallback to the GNOME
//! `org.gnome.desktop.interface accent-color` GSettings key, which stores one
//! of the named GNOME accent colors. A background monitor re-emits
//! `system-accent-color-changed` events when the desktop preference changes.

use tauri::AppHandle;

pub const ACCENT_COLOR_CHANGED_EVENT: &str = "system-accent-color-changed";

#[cfg(target_os = "linux")]
mod platform {
    use super::*;
    use futures_lite::StreamExt;
    use std::io::{BufRead, BufReader};
    use std::sync::Mutex;
    use tauri::Emitter;
    use zbus::zvariant::{OwnedValue, Structure, Value};

    /// Named GNOME accent colors (`--accent-bg-color` values from libadwaita).
    const GNOME_ACCENT_COLORS: [(&str, [u8; 3]); 9] = [
        ("blue", [0x35, 0x84, 0xe4]),
        ("teal", [0x21, 0x90, 0xa4]),
        ("green", [0x3a, 0x94, 0x4a]),
        ("yellow", [0xc8, 0x88, 0x00]),
        ("orange", [0xed, 0x5b, 0x00]),
        ("red", [0xe6, 0x2d, 0x42]),
        ("pink", [0xd5, 0x61, 0x99]),
        ("purple", [0x91, 0x41, 0xac]),
        ("slate", [0x6f, 0x83, 0x96]),
    ];

    /// Keeps the `gsettings monitor` child alive so it can be killed on exit.
    static GSETTINGS_MONITOR_CHILD: Mutex<Option<std::process::Child>> = Mutex::new(None);

    #[zbus::proxy(
        interface = "org.freedesktop.portal.Settings",
        default_service = "org.freedesktop.portal.Desktop",
        default_path = "/org/freedesktop/portal/desktop"
    )]
    trait PortalSettings {
        #[zbus(name = "ReadOne")]
        fn read_one(&self, namespace: &str, key: &str) -> zbus::Result<OwnedValue>;

        #[zbus(signal)]
        fn setting_changed(
            &self,
            namespace: String,
            key: String,
            value: OwnedValue,
        ) -> zbus::Result<()>;
    }

    fn gnome_accent_rgb(name: &str) -> Option<[u8; 3]> {
        GNOME_ACCENT_COLORS
            .iter()
            .find(|(candidate, _)| *candidate == name)
            .map(|(_, rgb)| *rgb)
    }

    fn to_byte(component: f64) -> u8 {
        (component.clamp(0.0, 1.0) * 255.0).round() as u8
    }

    fn parse_portal_color(value: &OwnedValue) -> Result<[u8; 3], String> {
        // ReadOne and SettingChanged wrap the payload in variant layers: unwrap.
        let mut current: &Value = value;
        while let Value::Value(inner) = current {
            current = inner;
        }
        let structure = Structure::try_from(current)
            .map_err(|err| format!("Unexpected accent-color payload: {err}"))?;
        let fields = structure.fields();
        if fields.len() != 3 {
            return Err(format!(
                "accent-color must have 3 components, got {}",
                fields.len()
            ));
        }
        let component = |index: usize| {
            f64::try_from(&fields[index])
                .map_err(|err| format!("accent-color component {index} is not a float: {err}"))
        };
        Ok([
            to_byte(component(0)?),
            to_byte(component(1)?),
            to_byte(component(2)?),
        ])
    }

    async fn read_portal_accent_color() -> Result<[u8; 3], String> {
        let connection = zbus::Connection::session()
            .await
            .map_err(|err| format!("D-Bus session connection failed: {err}"))?;
        let proxy = PortalSettingsProxy::new(&connection)
            .await
            .map_err(|err| format!("Portal settings proxy failed: {err}"))?;
        let value = proxy
            .read_one("org.freedesktop.appearance", "accent-color")
            .await
            .map_err(|err| format!("Portal ReadOne failed: {err}"))?;
        parse_portal_color(&value)
    }

    fn read_gsettings_accent_color() -> Result<[u8; 3], String> {
        let output = std::process::Command::new("gsettings")
            .args(["get", "org.gnome.desktop.interface", "accent-color"])
            .output()
            .map_err(|err| format!("Failed to run gsettings: {err}"))?;
        if !output.status.success() {
            return Err(format!("gsettings exited with status {}", output.status));
        }
        let raw = String::from_utf8_lossy(&output.stdout);
        let name = raw.trim().trim_matches('\'');
        gnome_accent_rgb(name).ok_or_else(|| format!("Unknown GNOME accent color '{name}'"))
    }

    pub async fn read_system_accent_color() -> Result<[u8; 3], String> {
        match read_portal_accent_color().await {
            Ok(rgb) => {
                log::info!(
                    "[AccentColor] Portal accent color: #{:02x}{:02x}{:02x}",
                    rgb[0],
                    rgb[1],
                    rgb[2]
                );
                Ok(rgb)
            }
            Err(portal_err) => {
                log::info!(
                    "[AccentColor] Portal accent color unavailable ({portal_err}); \
                     trying GSettings"
                );
                let rgb = read_gsettings_accent_color()?;
                log::info!(
                    "[AccentColor] GSettings accent color: #{:02x}{:02x}{:02x}",
                    rgb[0],
                    rgb[1],
                    rgb[2]
                );
                Ok(rgb)
            }
        }
    }

    async fn monitor_portal(app: AppHandle) -> Result<(), String> {
        let connection = zbus::Connection::session()
            .await
            .map_err(|err| format!("D-Bus session connection failed: {err}"))?;
        let proxy = PortalSettingsProxy::new(&connection)
            .await
            .map_err(|err| format!("Portal settings proxy failed: {err}"))?;
        let mut stream = proxy
            .receive_setting_changed()
            .await
            .map_err(|err| format!("Portal signal subscription failed: {err}"))?;

        while let Some(signal) = stream.next().await {
            let Ok(args) = signal.args() else {
                continue;
            };
            if args.namespace() != "org.freedesktop.appearance" || args.key() != "accent-color" {
                continue;
            }
            if let Ok(rgb) = parse_portal_color(args.value()) {
                if let Err(err) = app.emit(ACCENT_COLOR_CHANGED_EVENT, rgb) {
                    log::warn!("[AccentColor] Failed to emit accent color event: {err}");
                }
            }
        }
        Ok(())
    }

    fn monitor_gsettings(app: AppHandle) {
        let mut child = match std::process::Command::new("gsettings")
            .args(["monitor", "org.gnome.desktop.interface", "accent-color"])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::null())
            .spawn()
        {
            Ok(child) => child,
            Err(err) => {
                log::info!("[AccentColor] gsettings monitor unavailable: {err}");
                return;
            }
        };

        let Some(stdout) = child.stdout.take() else {
            let _ = child.kill();
            return;
        };

        match GSETTINGS_MONITOR_CHILD.lock() {
            Ok(mut guard) => *guard = Some(child),
            Err(err) => {
                log::warn!("[AccentColor] Failed to store gsettings monitor child: {err}");
                return;
            }
        }

        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines() {
                let Ok(line) = line else { break };
                // Lines look like: accent-color: 'blue'
                let Some((_, value)) = line.split_once(':') else {
                    continue;
                };
                let name = value.trim().trim_matches('\'');
                if let Some(rgb) = gnome_accent_rgb(name) {
                    if let Err(err) = app.emit(ACCENT_COLOR_CHANGED_EVENT, rgb) {
                        log::warn!("[AccentColor] Failed to emit accent color event: {err}");
                    }
                }
            }
        });
    }

    pub fn spawn_accent_color_monitor(app: AppHandle) {
        let portal_app = app.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(err) = monitor_portal(portal_app).await {
                log::info!("[AccentColor] Portal accent color monitor not active: {err}");
            }
        });
        monitor_gsettings(app);
    }

    pub fn shutdown_monitors() {
        if let Ok(mut guard) = GSETTINGS_MONITOR_CHILD.lock() {
            if let Some(mut child) = guard.take() {
                let _ = child.kill();
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn maps_all_named_gnome_accent_colors() {
            let expected: [(&str, [u8; 3]); 9] = [
                ("blue", [0x35, 0x84, 0xe4]),
                ("teal", [0x21, 0x90, 0xa4]),
                ("green", [0x3a, 0x94, 0x4a]),
                ("yellow", [0xc8, 0x88, 0x00]),
                ("orange", [0xed, 0x5b, 0x00]),
                ("red", [0xe6, 0x2d, 0x42]),
                ("pink", [0xd5, 0x61, 0x99]),
                ("purple", [0x91, 0x41, 0xac]),
                ("slate", [0x6f, 0x83, 0x96]),
            ];
            for (name, rgb) in expected {
                assert_eq!(gnome_accent_rgb(name), Some(rgb), "for {name}");
            }
            assert_eq!(gnome_accent_rgb("ultraviolet"), None);
        }

        #[test]
        fn clamps_portal_components_to_bytes() {
            assert_eq!(to_byte(0.0), 0);
            assert_eq!(to_byte(0.5), 128);
            assert_eq!(to_byte(1.0), 255);
            assert_eq!(to_byte(1.2), 255);
            assert_eq!(to_byte(-0.3), 0);
        }
    }
}

#[cfg(not(target_os = "linux"))]
mod platform {
    use super::*;

    pub async fn read_system_accent_color() -> Result<[u8; 3], String> {
        Err("System accent color is not supported on this platform.".to_string())
    }

    pub fn spawn_accent_color_monitor(_app: AppHandle) {}

    pub fn shutdown_monitors() {}
}

pub use platform::{read_system_accent_color, shutdown_monitors, spawn_accent_color_monitor};
