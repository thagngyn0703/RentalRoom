---
version: 2
name: TroChung Everyday Living
description: A clear, approachable rental marketplace for Vietnamese users.
colors:
  primary: "#087F72"
  primary-dark: "#075B51"
  secondary: "#B76536"
  surface: "#FFFFFF"
  surface-soft: "#F6F8F5"
  on-surface: "#193B34"
  on-surface-muted: "#64756F"
  border: "#E1E9E3"
  error: "#C62828"
typography:
  heading:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter, Arial, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    borderColor: "{colors.border}"
  home-hero:
    rounded: 24px
    textOverlay: separate-column
    imageFit: cover
---

## Overview

TroChung should feel practical, friendly and trustworthy. Housing information
is the focus; decoration must never compete with prices, locations or actions.

## Colors

Teal identifies primary actions, forest green anchors navigation and the footer,
and warm ivory surfaces keep listing photography legible. Clay is an accent.
Normal text must meet WCAG AA contrast.

## Typography

Inter is the product typeface. Headings are decisive and compact; body copy is
comfortable at mobile widths. Truncation is reserved for listing-card summaries.

## Layout

Use an 8px-based rhythm with a 4px micro-step. Desktop content uses a bounded
grid; mobile becomes one column with at least 16px side padding. No component
may create horizontal page overflow.

## Elevation & Depth

Prefer borders and restrained soft shadows. Elevation communicates actionable
cards or sticky navigation, not decoration.

## Shapes

Use 6–16px radii consistently. Pills are limited to compact status and price
chips.

## Components

Legacy carousel artwork already contains campaign typography, so it must not receive
an additional caption overlay. Images use meaningful alt text; controls remain
keyboard accessible and visible against the artwork.

Buttons require visible hover, pressed, disabled and keyboard-focus states.
Loading, empty and error states must reserve stable space and use clear copy.

## Do's and Don'ts

- Do preserve a clear hierarchy from navigation to campaign to listings.
- Do test desktop and mobile with real data and slow/error states.
- Do keep text and interactive controls within their containers.
- Don't overlay duplicate marketing copy on text-bearing artwork.
- Don't hide broken images, API failures or focus indicators.
- Don't use viewport-only heights that clip content.
