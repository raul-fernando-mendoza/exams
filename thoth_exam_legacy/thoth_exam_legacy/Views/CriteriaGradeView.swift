//
//  CriteriaGradeView.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible criteria grade view
//

import UIKit

class CriteriaGradeView: UIView {

    // MARK: - Properties

    private let criteriaGrade: CriteriaGradeEntity
    private let scoreType: String
    var onScoreChanged: (() -> Void)?

    // MARK: - UI Components

    private let containerView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = .white
        view.layer.cornerRadius = 12
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOpacity = 0.05
        view.layer.shadowOffset = CGSize(width: 0, height: 1)
        view.layer.shadowRadius = 2
        return view
    }()

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 12
        return sv
    }()

    private let headerLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.boldSystemFont(ofSize: 20)
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

    // MARK: - Initialization

    init(criteriaGrade: CriteriaGradeEntity, scoreType: String) {
        self.criteriaGrade = criteriaGrade
        self.scoreType = scoreType
        super.init(frame: .zero)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - UI Setup

    private func setupUI() {
        addSubview(containerView)
        containerView.addSubview(stackView)

        // Header
        headerLabel.text = criteriaGrade.label ?? "Criteria \(criteriaGrade.idx)"
        stackView.addArrangedSubview(headerLabel)

        // Description
        if let desc = criteriaGrade.criteriaDescription, !desc.isEmpty {
            descriptionLabel.text = desc
            stackView.addArrangedSubview(descriptionLabel)
        }

        // Aspect views
        for aspect in criteriaGrade.sortedAspectGrades {
            let aspectView: UIView
            if scoreType == "starts" {
                let starsView = AspectGradeStarsView(aspectGrade: aspect)
                starsView.onChanged = { [weak self] in
                    self?.recalculatePoints()
                    self?.onScoreChanged?()
                }
                aspectView = starsView
            } else {
                let statusView = AspectGradeStatusView(aspectGrade: aspect)
                statusView.onChanged = { [weak self] in
                    self?.recalculatePoints()
                    self?.onScoreChanged?()
                }
                aspectView = statusView
            }
            stackView.addArrangedSubview(aspectView)
        }

        NSLayoutConstraint.activate([
            containerView.topAnchor.constraint(equalTo: topAnchor),
            containerView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            containerView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            containerView.bottomAnchor.constraint(equalTo: bottomAnchor),

            stackView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 16),
            stackView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            stackView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            stackView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16)
        ])
    }

    private func recalculatePoints() {
        let aspects = criteriaGrade.sortedAspectGrades
        let earned = aspects.reduce(0.0) { $0 + $1.score }
        let available = Double(aspects.count)
        criteriaGrade.earnedPoints = earned
        criteriaGrade.availablePoints = available
        if available > 0 {
            criteriaGrade.score = (earned / available * 10 * 10).rounded() / 10
        }
    }
}
