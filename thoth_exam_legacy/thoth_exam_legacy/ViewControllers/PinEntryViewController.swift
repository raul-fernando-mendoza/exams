//
//  PinEntryViewController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible PIN entry screen
//

import UIKit

class PinEntryViewController: UIViewController {

    // MARK: - Callbacks

    var onUnlocked: (() -> Void)?
    var onFailed: (() -> Void)?

    // MARK: - Properties

    private let staticPin = "12345"
    private let pinLength = 5
    private var enteredPin = ""

    // MARK: - UI Components

    private let cancelButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Cancelar", for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 20)
        return button
    }()

    private let lockImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.tintColor = UIColor(red: 0.0, green: 0.48, blue: 1.0, alpha: 1.0)
        imageView.contentMode = .scaleAspectFit
        // Use text if image not available
        return imageView
    }()

    private let lockLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "🔒"
        label.font = UIFont.systemFont(ofSize: 57)
        label.textAlignment = .center
        return label
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "Enter your PIN"
        label.font = UIFont.boldSystemFont(ofSize: 26)
        label.textAlignment = .center
        return label
    }()

    private let errorLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textColor = .red
        label.font = UIFont.systemFont(ofSize: 16)
        label.textAlignment = .center
        label.numberOfLines = 0
        label.isHidden = true
        return label
    }()

    private let dotsStackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .horizontal
        sv.spacing = 16
        sv.distribution = .equalSpacing
        return sv
    }()

    private var dotViews: [UIView] = []

    private let numpadStackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 12
        sv.distribution = .equalSpacing
        return sv
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    // MARK: - UI Setup

    private func setupUI() {
        view.backgroundColor = .white

        // Cancel button (only if onFailed is set)
        if onFailed != nil {
            view.addSubview(cancelButton)
            cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)

            NSLayoutConstraint.activate([
                cancelButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
                cancelButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16)
            ])
        }

        // Lock icon/emoji
        view.addSubview(lockLabel)
        view.addSubview(titleLabel)
        view.addSubview(errorLabel)
        view.addSubview(dotsStackView)
        view.addSubview(numpadStackView)

        // Create PIN dots
        for _ in 0..<pinLength {
            let dot = UIView()
            dot.translatesAutoresizingMaskIntoConstraints = false
            dot.backgroundColor = UIColor(white: 0.8, alpha: 1.0)
            dot.layer.cornerRadius = 8
            dotsStackView.addArrangedSubview(dot)
            dotViews.append(dot)

            NSLayoutConstraint.activate([
                dot.widthAnchor.constraint(equalToConstant: 16),
                dot.heightAnchor.constraint(equalToConstant: 16)
            ])
        }

        // Create numpad
        setupNumpad()

        NSLayoutConstraint.activate([
            lockLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            lockLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 80),

            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            titleLabel.topAnchor.constraint(equalTo: lockLabel.bottomAnchor, constant: 16),

            errorLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            errorLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            errorLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            errorLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),

            dotsStackView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            dotsStackView.topAnchor.constraint(equalTo: errorLabel.bottomAnchor, constant: 32),

            numpadStackView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            numpadStackView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -32)
        ])
    }

    private func setupNumpad() {
        // Rows 1-3 (1-9)
        for row in 0..<3 {
            let rowStack = UIStackView()
            rowStack.axis = .horizontal
            rowStack.spacing = 24
            rowStack.distribution = .equalSpacing

            for col in 0..<3 {
                let digit = row * 3 + col + 1
                let button = createNumpadButton(digit: "\(digit)")
                rowStack.addArrangedSubview(button)
            }

            numpadStackView.addArrangedSubview(rowStack)
        }

        // Row 4 (empty, 0, delete)
        let lastRow = UIStackView()
        lastRow.axis = .horizontal
        lastRow.spacing = 24
        lastRow.distribution = .equalSpacing

        // Empty space
        let emptyView = UIView()
        emptyView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            emptyView.widthAnchor.constraint(equalToConstant: 72),
            emptyView.heightAnchor.constraint(equalToConstant: 72)
        ])
        lastRow.addArrangedSubview(emptyView)

        // Zero button
        let zeroButton = createNumpadButton(digit: "0")
        lastRow.addArrangedSubview(zeroButton)

        // Delete button
        let deleteButton = UIButton(type: .system)
        deleteButton.translatesAutoresizingMaskIntoConstraints = false
        deleteButton.setTitle("⌫", for: .normal)
        deleteButton.titleLabel?.font = UIFont.systemFont(ofSize: 28)
        deleteButton.addTarget(self, action: #selector(deleteTapped), for: .touchUpInside)
        NSLayoutConstraint.activate([
            deleteButton.widthAnchor.constraint(equalToConstant: 72),
            deleteButton.heightAnchor.constraint(equalToConstant: 72)
        ])
        lastRow.addArrangedSubview(deleteButton)

        numpadStackView.addArrangedSubview(lastRow)
    }

    private func createNumpadButton(digit: String) -> UIButton {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle(digit, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 33, weight: .medium)
        button.backgroundColor = UIColor(white: 0.95, alpha: 1.0)
        button.layer.cornerRadius = 36
        button.tag = Int(digit) ?? 0
        button.addTarget(self, action: #selector(digitTapped(_:)), for: .touchUpInside)

        NSLayoutConstraint.activate([
            button.widthAnchor.constraint(equalToConstant: 72),
            button.heightAnchor.constraint(equalToConstant: 72)
        ])

        return button
    }

    // MARK: - Actions

    @objc private func cancelTapped() {
        onFailed?()
    }

    @objc private func digitTapped(_ sender: UIButton) {
        guard enteredPin.count < pinLength else { return }

        enteredPin += "\(sender.tag)"
        updateDots()

        if enteredPin.count == pinLength {
            validate()
        }
    }

    @objc private func deleteTapped() {
        guard !enteredPin.isEmpty else { return }
        enteredPin.removeLast()
        updateDots()
    }

    private func updateDots() {
        for (index, dot) in dotViews.enumerated() {
            if index < enteredPin.count {
                dot.backgroundColor = UIColor(red: 0.0, green: 0.48, blue: 1.0, alpha: 1.0)
            } else {
                dot.backgroundColor = UIColor(white: 0.8, alpha: 1.0)
            }
        }
    }

    private func validate() {
        if enteredPin == staticPin {
            onUnlocked?()
        } else {
            enteredPin = ""
            updateDots()

            if onFailed != nil {
                triggerError("Incorrect PIN. Returning to grades page...")
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
                    self?.onFailed?()
                }
            } else {
                triggerError("Incorrect PIN. Try again.")
            }
        }
    }

    private func triggerError(_ message: String) {
        errorLabel.text = message
        errorLabel.isHidden = false

        // Shake animation
        let animation = CAKeyframeAnimation(keyPath: "transform.translation.x")
        animation.timingFunction = CAMediaTimingFunction(name: .linear)
        animation.duration = 0.4
        animation.values = [-10, 10, -10, 10, -5, 5, -2, 2, 0]
        dotsStackView.layer.add(animation, forKey: "shake")

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.errorLabel.isHidden = true
        }
    }
}
