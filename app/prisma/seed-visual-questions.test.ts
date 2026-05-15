import { describe, it, expect } from "vitest"
import { stripLeadingNumber, parsePaperMeta, primaryImageUrl } from "./seed-visual-questions"

describe("stripLeadingNumber", () => {
  it("removes leading question number", () => {
    expect(stripLeadingNumber("5 The diagram shows a cell.")).toBe("The diagram shows a cell.")
  })
  it("handles two-digit question numbers", () => {
    expect(stripLeadingNumber("12 The graph shows temperature.")).toBe("The graph shows temperature.")
  })
  it("leaves text unchanged when no leading number", () => {
    expect(stripLeadingNumber("No number here.")).toBe("No number here.")
  })
})

describe("parsePaperMeta", () => {
  it("parses March paper", () => {
    expect(parsePaperMeta("0610_m22_qp_12.pdf")).toEqual({
      paper: "0610/12",
      year: "2022",
      session: "March",
    })
  })
  it("parses June paper", () => {
    expect(parsePaperMeta("0610_s21_qp_31.pdf")).toEqual({
      paper: "0610/31",
      year: "2021",
      session: "June",
    })
  })
  it("parses November paper", () => {
    expect(parsePaperMeta("0610_w20_qp_42.pdf")).toEqual({
      paper: "0610/42",
      year: "2020",
      session: "November",
    })
  })
})

describe("primaryImageUrl", () => {
  it("returns biology-prefixed webp path from first image_file", () => {
    expect(primaryImageUrl(["images/0610_m20_qp_12_q5_p3_seg1.webp"])).toBe(
      "biology/0610_m20_qp_12_q5_p3_seg1.webp"
    )
  })
  it("uses first file when multiple exist", () => {
    expect(primaryImageUrl(["images/first.webp", "images/second.webp"])).toBe("biology/first.webp")
  })
  it("returns null for empty array", () => {
    expect(primaryImageUrl([])).toBeNull()
  })
})
