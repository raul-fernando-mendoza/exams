//
//  AspectGradeStarsView.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible star rating view
//

import UIKit

class AspectGradeStarsView: UIView {

    // MARK: - Properties

    private let aspectGrade: AspectGradeEntity
    private let maxStars = 5
    var onChanged: (() -> Void)?

    // MARK: - UI Components

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 8
        return sv
    }()

    private let labelLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 18)
        label.numberOfLines = 0
        return label
    }()

    private let descriptionLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 15)
        label.textColor = .gray
        label.numberOfLines = 0
        return label
    }()

    private let starsStackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .horizontal
        sv.spacing = 8
        sv.distribution = .fill
        return sv
    }()

    private var starButtons: [UIButton] = []

    // MARK: - Initialization

    init(aspectGrade: AspectGradeEntity) {
        self.aspectGrade = aspectGrade
        super.init(frame: .zero)
        setupUI()
        updateStars()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - UI Setup

    private func setupUI() {
        addSubview(stackView)

        // Label
        labelLabel.text = aspectGrade.label ?? "Aspect \(aspectGrade.idx)"
        stackView.addArrangedSubview(labelLabel)

        // Description
        if let desc = aspectGrade.aspectDescription, !desc.isEmpty {
            descriptionLabel.text = desc
            stackView.addArrangedSubview(descriptionLabel)
        }

        // Star buttons
        for star in 1...maxStars {
            let button = UIButton(type: .system)
            button.translatesAutoresizingMaskIntoConstraints = false
            button.setTitle("☆", for: .normal)
            button.titleLabel?.font = UIFont.systemFont(ofSize: 28)
            button.setTitleColor(UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0), for: .normal)
            button.tag = star
            button.addTarget(self, action: #selector(starTapped(_:)), for: .touchUpInside)
            starButtons.append(button)
            starsStackView.addArrangedSubview(button)
        }

        // Add spacer
        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        starsStackView.addArrangedSubview(spacer)

        stackView.addArrangedSubview(starsStackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: topAnchor, constant: 4),
            stackView.leadingAnchor.constraint(equalTo: leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -4)
        ])
    }

    private func updateStars() {
        // Score calculation: (star / 10) + 0.5
        // So 1 star = 0.55, 2 stars = 0.65, etc.
        // Reverse: star = (score - 0.5) * 10
        let currentStars = Int((aspectGrade.score - 0.5) * 10)

        for (index, button) in starButtons.enumerated() {
            let starNumber = index + 1
            if starNumber <= currentStars {
                button.setTitle("★", for: .normal)
            } else {
                button.setTitle("☆", for: .normal)
            }
        }
    }

    // MARK: - Actions

    @objc private func starTapped(_ sender: UIButton) {
        let star = sender.tag
        let newScore = (Double(star) / 10.0) + 0.5
        aspectGrade.score = newScore
        updateStars()
        onChanged?()
    }
}
