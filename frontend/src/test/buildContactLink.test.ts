import {describe, it, expect} from "vitest";
import { buildContactLink } from "../utils/buildContactLink";

describe("buildContactLink", () => {
  it("returns null when value is empty", () => {
    expect(buildContactLink("instagram", "")).toBeNull();
  });

  it("returns null when value is null", () => {
    expect(buildContactLink("instagram", null)).toBeNull(); 
  });

  it("returns correct Instagram link", () => {
    expect(buildContactLink("instagram", "@user")).toEqual({
      label: "@user on Instagram",
      href: "https://instagram.com/user",
    });
  });

  it("returns correct Intagram link when no leading @ is given", () => {
    expect(buildContactLink("instagram", "user")).toEqual({
      label: "@user on Instagram",
      href: "https://instagram.com/user",
    });
  });

  it("returns cprrect telegram link and removes leading @", () => {
    expect(buildContactLink("telegram", "@user")).toEqual({
      label: "@user on Telegram",
      href: "https://t.me/user",
    });
  });
  
  it("returns correct email link", () => {
    expect(buildContactLink("email", "user@example.com")).toEqual({
        label: "user@example.com",
        href: "mailto:user@example.com",
    });
  });
  
  it("returns correct discord label with no link", () => {  
    expect(buildContactLink("discord", "user")).toEqual({
        label: "user on Discord",
        href: null,
    });
  });

  it("falls back to default label with no link for unknown type", () => {
    expect(buildContactLink(null, "user")).toEqual({
        label: "user",
        href: null,
    });
  });


it("trims whitespace from value", () => {
  expect(buildContactLink("email", " user@example.com ")).toEqual({
    label: "user@example.com",
    href: "mailto:user@example.com",
  });
});
});