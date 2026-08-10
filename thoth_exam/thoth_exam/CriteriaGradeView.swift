import SwiftUI

struct CriteriaGradeView: View {
    @ObservedObject var criteriaGrade: CriteriaGradeEntity
    let scoreType: String
    let onScoreChanged: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(criteriaGrade.label ?? "Criteria \(criteriaGrade.idx)")
                    .font(.headline)
                Spacer()
                Text(String(format: "%.1f", criteriaGrade.earnedPoints * 10))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            if let desc = criteriaGrade.criteriaDescription, !desc.isEmpty {
                Text(desc)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            ForEach(criteriaGrade.sortedAspectGrades) { aspect in
                if scoreType == "stars" {
                    AspectGradeStarsView(aspectGrade: aspect, onChanged: {
                        recalculatePoints()
                        onScoreChanged()
                    })
                } else {
                    AspectGradeStatusView(aspectGrade: aspect, onChanged: {
                        recalculatePoints()
                        onScoreChanged()
                    })
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
        .padding(.horizontal)
    }

    private func recalculatePoints() {
        let aspects = criteriaGrade.sortedAspectGrades
        let earned = aspects.reduce(0.0) { $0 + ($1.isGraded ? $1.score : 0) }
        let available = Double(aspects.count)
        criteriaGrade.earnedPoints = earned
        criteriaGrade.availablePoints = available
        if available > 0 {
            criteriaGrade.score = (earned / available * 10 * 10).rounded() / 10
        }
    }
}
