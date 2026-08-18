//
//  UIColor+Extensions.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible color extensions
//

import UIKit

extension UIColor {

    static var appSystemBackground: UIColor {
        if #available(iOS 13.0, *) {
            return .systemBackground
        } else {
            return .white
        }
    }

    static var appSecondarySystemBackground: UIColor {
        if #available(iOS 13.0, *) {
            return .secondarySystemBackground
        } else {
            return UIColor(white: 0.95, alpha: 1.0)
        }
    }

    static var appSystemGray5: UIColor {
        if #available(iOS 13.0, *) {
            return .systemGray5
        } else {
            return UIColor(white: 0.9, alpha: 1.0)
        }
    }

    static var appSystemGray6: UIColor {
        if #available(iOS 13.0, *) {
            return .systemGray6
        } else {
            return UIColor(white: 0.95, alpha: 1.0)
        }
    }

    static var appLabel: UIColor {
        if #available(iOS 13.0, *) {
            return .label
        } else {
            return .black
        }
    }

    static var appSecondaryLabel: UIColor {
        if #available(iOS 13.0, *) {
            return .secondaryLabel
        } else {
            return .gray
        }
    }
}
