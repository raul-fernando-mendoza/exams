import SwiftUI

struct AspectGradeStarsView: View {
    @ObservedObject var aspectGrade: AspectGradeEntity
    let onChanged: () -> Void

    private let maxStars = 5

    // Score calculation: (star / 10) + 0.5, so 1 star = 0.6, 2 stars = 0.7, etc.
    // Reverse: star = (score - 0.5) * 10, rounded to absorb floating-point
    // imprecision (e.g. 0.6 - 0.5 isn't exactly 0.1) which otherwise
    // truncates 1- and 2-star scores down by one star.
    private var currentStars: Int {
        Int(((aspectGrade.score - 0.5) * 10).rounded())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(aspectGrade.label ?? "Aspect \(aspectGrade.idx)")
                .font(.subheadline)

            if let desc = aspectGrade.aspectDescription, !desc.isEmpty {
                Text(desc)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 8) {
                ForEach(1...maxStars, id: \.self) { star in
                    Button {
                        let newScore = (Double(star) / 10.0) + 0.5
                        aspectGrade.score = newScore
                        onChanged()
                    } label: {
                        Image(systemName: star <= currentStars ? "star.fill" : "star")
                            .foregroundColor(.yellow)
                            .font(.title3)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}
