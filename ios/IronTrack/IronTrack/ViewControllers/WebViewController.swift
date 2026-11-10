import UIKit
import WebKit
import AudioToolbox
import UserNotifications

class WebViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    var webView: WKWebView!
    var activityIndicator: UIActivityIndicatorView!
    
    // Default GitHub Pages URL - Can be updated in Config or by User
    private let defaultWebURL = "https://shyammvm.github.io/PersonalGym/"
    private let configURLKey = "IronTrackServerURL"

    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupWebView()
        setupActivityIndicator()
        requestNotificationPermissions()
        loadWebContent()
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    private func setupBackground() {
        view.backgroundColor = UIColor(red: 9/255, green: 10/255, blue: 15/255, alpha: 1.0)
    }

    private func setupWebView() {
        let contentController = WKUserContentController()
        
        // Add script message handlers for native features
        contentController.add(self, name: "haptics")
        contentController.add(self, name: "timerAlert")
        contentController.add(self, name: "saveConfig")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // Website preferences
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        config.defaultWebpagePreferences = preferences

        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 9/255, green: 10/255, blue: 15/255, alpha: 1.0)
        webView.scrollView.backgroundColor = UIColor(red: 9/255, green: 10/255, blue: 15/255, alpha: 1.0)
        
        // Smooth iOS scrolling & disable bounce if desired
        webView.scrollView.bounces = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupActivityIndicator() {
        activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.color = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)

        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    private func loadWebContent() {
        activityIndicator.startAnimating()
        
        // Check if user set a custom URL in UserDefaults
        let targetURLString = UserDefaults.standard.string(forKey: configURLKey) ?? defaultWebURL
        
        if let url = URL(string: targetURLString) {
            var request = URLRequest(url: url)
            request.cachePolicy = .returnCacheDataElseLoad
            webView.load(request)
        } else if let localHTMLPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
            let localURL = URL(fileURLWithPath: localHTMLPath)
            webView.loadFileURL(localURL, allowingReadAccessTo: localURL.deletingLastPathComponent())
        }
    }

    private func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted")
            }
        }
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "haptics" {
            guard let style = message.body as? String else { return }
            triggerHaptic(style: style)
        } else if message.name == "timerAlert" {
            if let data = message.body as? [String: Any],
               let title = data["title"] as? String,
               let body = data["body"] as? String {
                scheduleTimerNotification(title: title, body: body)
                triggerHaptic(style: "success")
                AudioServicesPlaySystemSound(1005) // iOS SMS / chime sound
            }
        } else if message.name == "saveConfig" {
            if let data = message.body as? [String: Any],
               let newURL = data["url"] as? String,
               let validURL = URL(string: newURL) {
                UserDefaults.standard.set(newURL, forKey: configURLKey)
                webView.load(URLRequest(url: validURL))
            }
        }
    }

    private func triggerHaptic(style: String) {
        DispatchQueue.main.async {
            switch style {
            case "light":
                let generator = UIImpactFeedbackGenerator(style: .light)
                generator.impactOccurred()
            case "medium":
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.impactOccurred()
            case "heavy":
                let generator = UIImpactFeedbackGenerator(style: .heavy)
                generator.impactOccurred()
            case "success":
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
            case "warning":
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.warning)
            case "error":
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.error)
            default:
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.impactOccurred()
            }
        }
    }

    private func scheduleTimerNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
        
        // Inject JS bridge helper
        let initBridgeJS = """
        window.isNativeIOSApp = true;
        window.nativeHaptic = function(type) {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptics) {
                window.webkit.messageHandlers.haptics.postMessage(type);
            }
        };
        window.nativeTimerAlert = function(title, body) {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.timerAlert) {
                window.webkit.messageHandlers.timerAlert.postMessage({title: title, body: body});
            }
        };
        """
        webView.evaluateJavaScript(initBridgeJS, completionHandler: nil)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        showOfflineAlert()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        showOfflineAlert()
    }

    private func showOfflineAlert() {
        let alert = UIAlertController(
            title: "Network Connection",
            message: "Unable to connect to the gym server. Would you like to retry or update your server URL?",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Retry", style: .default, handler: { [weak self] _ in
            self?.loadWebContent()
        }))
        alert.addAction(UIAlertAction(title: "Settings", style: .default, handler: { [weak self] _ in
            self?.promptChangeURL()
        }))
        present(alert, animated: true)
    }

    private func promptChangeURL() {
        let current = UserDefaults.standard.string(forKey: configURLKey) ?? defaultWebURL
        let alert = UIAlertController(title: "Server URL", message: "Enter your hosted GitHub Pages URL:", preferredStyle: .alert)
        alert.addTextField { textField in
            textField.text = current
            textField.keyboardType = .URL
            textField.autocapitalizationType = .none
        }
        alert.addAction(UIAlertAction(title: "Save & Reload", style: .default, handler: { [weak self, weak alert] _ in
            guard let text = alert?.textFields?.first?.text, let url = URL(string: text) else { return }
            UserDefaults.standard.set(text, forKey: self?.configURLKey ?? "IronTrackServerURL")
            self?.webView.load(URLRequest(url: url))
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }
}

