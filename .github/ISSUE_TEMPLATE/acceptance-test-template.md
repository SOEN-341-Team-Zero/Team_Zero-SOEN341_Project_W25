name: Acceptance Test
description: Template for acceptance test issues
title: "[Acceptance Test] "
labels: ["acceptance test"]
assignees: ""

body:
  - type: markdown
    attributes:
      value: |
        ## Issue Tracking
        This acceptance test is for #<ISSUE_NUMBER>

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: "Acceptance Criteria"
      description: "List the conditions that must be met."
    validations:
      required: true
