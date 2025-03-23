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
      description: "List of conditions that must be met."
      value: |
        1. 
    validations:
      required: true
