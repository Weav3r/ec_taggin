# Proposed follow-up collections

## Common fields for all collections

Shared identity, timestamps, and assembly ownership used by every collection below. These are common fields, not a separate collection.

| Field | Type | Required | Definition |
|---|---|---|---|
| `$id` | Appwrite document ID | System | Primary key. |
| `$createdAt` | Datetime | System | Creation timestamp. |
| `$updatedAt` | Datetime | System | Last-update timestamp. |
| `assemblyId` | String(36) | Yes | Owning Appwrite Team ID. |

## `service_occurrences`

Records each dated attendance unit and whether its register is finalised. A counted unit can group eligible first/second services so a member is not counted twice for one Sunday.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `groupKey` | String(64) | Yes | Stable counted attendance group. |
| `localDate` | String(10) | Yes | Valid `YYYY-MM-DD` in the occurrence timezone. |
| `startsAt` | Datetime UTC | Yes | Start of the counted attendance unit. |
| `endsAt` | Datetime UTC | Yes | After `startsAt`. |
| `timezone` | String(64) | Yes | IANA timezone snapshot. |
| `lifecycle` | Enum | Yes | `planned`, `completed`, `cancelled`. |
| `registerState` | Enum | Yes | `open`, `finalised`, `reopened`. |
| `finalisedAt` | Datetime UTC | Conditional | Required when finalised. |
| `finalisedByAccountId` | String(36) | Conditional | Auth account ID; required when finalised. |
| `sourceTemplateIds` | String(36)[] | No | Bounded references to eligible service templates or slots. |
| `revision` | Integer | Yes | Positive current version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `attendance_expectations`

Defines which service group a member was expected to attend and during which dates. This prevents services before verified membership, or after a transfer, from becoming false absences.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `memberDocumentId` | String(36) | Yes | Reference to `users.$id`, not an Auth UID or member code. |
| `groupKey` | String(64) | Yes | Expected attendance group. |
| `fromOn` | String(10) | Yes | Inclusive verified counting start, `YYYY-MM-DD`. |
| `untilOn` | String(10) | No | Inclusive end; cannot precede `fromOn`. |
| `verificationSource` | Enum | Yes | `staff_verified`, `confirmed_registration`, `transfer`. |
| `recordedByAccountId` | String(36) | Yes | Authorized enrollment actor. |
| `recordedAt` | Datetime UTC | Yes | Verification recording time. |
| `revision` | Integer | Yes | Positive current version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `attendance_decisions`

Stores staff-reviewed attendance outcomes for each member and occurrence. Corrections append a new revision linked to the earlier decision; missing evidence remains unknown rather than absent.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `occurrenceId` | String(36) | Yes | Reference to `service_occurrences.$id`. |
| `memberDocumentId` | String(36) | Yes | Reference to `users.$id`. |
| `outcome` | Enum | Yes | `present`, `absent`, `unknown`, `not_expected`. |
| `decisionRevision` | Integer | Yes | Positive monotonic revision per occurrence/member. |
| `supersedesDecisionId` | String(36) | Conditional | Previous committed decision; absent for revision 1. |
| `reviewedAt` | Datetime UTC | Yes | Staff review time. |
| `reviewedByAccountId` | String(36) | Yes | Assigned confirmer's Auth account ID. |
| `reasonCode` | Enum | Yes | Approved review/correction reason code. |
| `sourceKind` | Enum | Yes | `staff_review`, `verified_import`. |
| `evidenceReference` | String(128) | No | Validated, occurrence-scoped evidence reference. |
| `operationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `follow_up_policies`

Holds an assembly's absence rule: which service group counts, the consecutive-absence threshold, and when counting begins. Changing the threshold changes flags, not existing care cases.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `groupKey` | String(64) | Yes | Approved counted service group. |
| `threshold` | Integer | Yes | 1–52 consecutive confirmed absences; initial server-supplied value 3. |
| `enabled` | Boolean | Yes | Explicit rule activation. |
| `effectiveFromOn` | String(10) | Yes | Verified counting start, `YYYY-MM-DD`. |
| `timezone` | String(64) | Yes | Valid IANA assembly timezone. |
| `revision` | Integer | Yes | Positive policy version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |
| `updatedByAccountId` | String(36) | Yes | Authorized policy administrator. |

## `care_subjects`

Coordinates follow-up for one person within an assembly. It holds the active-case link, call permission, handled absence episode, and a derived attendance summary without replacing the member or visitor profile.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `subjectType` | Enum | Yes | `member`, `visitor`; visitor support reserved until its collection is enabled. |
| `subjectDocumentId` | String(36) | Yes | `users.$id` or proposed `visitors.$id`, according to `subjectType`. |
| `activeCaseId` | String(36) | No | Reference to the subject's single open `care_cases` record. |
| `lastHandledEpisodeKey` | String(64) | No | Closed absence episode already addressed by care. |
| `callPermission` | Enum | Yes | `unknown`, `granted`, `declined`, `withdrawn`; initial server-supplied value `unknown`. Manual phone follow-up only. |
| `permissionRecordedAt` | Datetime UTC | Conditional | Required for a known recorded permission response. |
| `permissionRecordedByAccountId` | String(36) | Conditional | Auth account recording that response. |
| `policyId` | String(36) | Conditional | Reference to `follow_up_policies.$id`; member projections only. |
| `evaluatedPolicyRevision` | Integer | Conditional | Policy version used for the current projection. |
| `currentEpisodeKey` | String(64) | Conditional | Stable absence-episode identity, excluding threshold and policy revision. |
| `missedCount` | Integer | Conditional | Non-negative derived confirmed-absence count. |
| `countIsLowerBound` | Boolean | Conditional | Whether the complete historical streak is uncertain. |
| `flagState` | Enum | Yes | `clear`, `flagged`, `needs_review`, `stale`; visitors have no member-absence flag. |
| `evaluatedFromOn` | String(10) | Conditional | Beginning of evaluated source range. |
| `evaluatedThroughOccurrenceId` | String(36) | Conditional | Last evaluated `service_occurrences.$id`. |
| `evaluatedAt` | Datetime UTC | Conditional | Projection computation time. |
| `sourceWatermark` | String(64) | Conditional | Relevant committed occurrence, decision and expectation version digest. |
| `revision` | Integer | Yes | Positive coordination version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `care_cases`

Represents the overall care case, including its owner, opening reason, and closure. A case can contain several calls, visits, notes, and referrals; recording one interaction does not automatically close it.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `subjectId` | String(36) | Yes | Reference to `care_subjects.$id`. |
| `triggerKind` | Enum | Yes | `absence`, `manual`, `visitor_care`; visitor trigger reserved until enabled. |
| `openingEpisodeKey` | String(64) | Conditional | Required for an absence-triggered case. |
| `openingPolicyRevision` | Integer | Conditional | Policy version at opening; required for absence-triggered cases. |
| `status` | Enum | Yes | `open`, `closed`. |
| `ownerType` | Enum | Conditional | `account`, `assembly_role`; nullable together with `ownerKey`. |
| `ownerKey` | String(64) | Conditional | Auth account ID or validated assembly-role key. |
| `openedAt` | Datetime UTC | Yes | Case opening time. |
| `openedActorKind` | Enum | Yes | `account`, `system`. |
| `openedActorKey` | String(64) | Yes | Auth account ID or approved automation identity. |
| `closedAt` | Datetime UTC | Conditional | Required on closure. |
| `closedByAccountId` | String(36) | Conditional | Authorized closing actor; required on closure. |
| `closureCode` | Enum | Conditional | Approved closure code, e.g. `no_further_action`, `duplicate`, `moved`, `incorrect_evidence`. |
| `revision` | Integer | Yes | Positive case version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |
| `closingHandledEpisodeKey` | String(64) | Conditional | Verified absence episode explicitly acknowledged by closure. |
| `manualReopenReasonCode` | Enum | No | Approved reason for explicitly reopening a handled episode. |

## `care_plans`

Stores proposed and scheduled calls or visits, their assignees, agreement, and completion or cancellation. Plans are separate from case ownership so a handoff does not silently reassign an agreed appointment.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `caseId` | String(36) | Yes | Reference to `care_cases.$id`. |
| `kind` | Enum | Yes | `call`, `visit`. |
| `status` | Enum | Yes | `proposed`, `scheduled`, `completed`, `cancelled`. |
| `scheduledAt` | Datetime UTC | Conditional | Required when scheduled. |
| `timezone` | String(64) | Conditional | Agreed IANA timezone; required when scheduled. |
| `assigneeType` | Enum | Yes | `account`, `assembly_role`. |
| `assigneeKey` | String(64) | Yes | Validated Auth account ID or assembly-role key. |
| `agreementStatus` | Enum | Yes | `pending`, `agreed`, `declined`, `withdrawn`; visits require `agreed` before scheduling. |
| `agreementRecordedAt` | Datetime UTC | Conditional | Required for a known visit response. |
| `agreementRecordedByAccountId` | String(36) | Conditional | Auth account recording the visit response. |
| `completedAt` | Datetime UTC | Conditional | Required on completion. |
| `cancelledAt` | Datetime UTC | Conditional | Required on cancellation. |
| `cancellationCode` | Enum | Conditional | Approved cancellation reason. |
| `createdByAccountId` | String(36) | Yes | Plan creation actor. |
| `revision` | Integer | Yes | Positive plan version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `care_notes`

Stores restricted notes and outcomes from calls or visits. Note bodies remain separate from shared referral summaries and action history; corrections and authorized redactions retain their record links.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `caseId` | String(36) | Yes | Reference to `care_cases.$id`. |
| `planId` | String(36) | No | Related `care_plans.$id` in the same case. |
| `kind` | Enum | Yes | `call`, `visit`. |
| `outcome` | Enum | Yes | `reached`, `no_answer`, `support_requested`, `reports_returning`. |
| `happenedAt` | Datetime UTC | Yes | Actual contact time; cannot be in the future. |
| `recordedByAccountId` | String(36) | Yes | Recording actor. |
| `body` | String(800), nullable | Conditional | Nonblank for retained active/superseded notes; null after authorized redaction. |
| `visibilityScope` | Enum | Yes | `assigned_care`, `specialist`. |
| `readerPolicyKey` | String(64) | Yes | Enforced note-access policy reference. |
| `supersedesNoteId` | String(36) | No | Prior note in the correction chain. |
| `recordState` | Enum | Yes | `active`, `superseded`, `redacted`. |
| `operationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `care_referrals`

Tracks escalation to an eligible specialist person or group using a limited summary. Acceptance records a handoff of case ownership; resolving the referral remains separate from closing the whole case.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `caseId` | String(36) | Yes | Reference to `care_cases.$id`. |
| `sourceNoteId` | String(36) | Yes | Source `care_notes.$id` in the same case. |
| `recipientType` | Enum | Yes | `account`, `assembly_role`. |
| `recipientKey` | String(64) | Yes | Eligible Auth account ID or assembly-role key. |
| `summary` | String(280) | Yes | Explicit nonblank limited summary; separate from the source note body. |
| `priority` | Enum | Yes | `routine`, `priority_review`. |
| `state` | Enum | Yes | `requested`, `accepted`, `resolved`, `declined`, `cancelled`. |
| `requestedAt` | Datetime UTC | Yes | Request time. |
| `requestedByAccountId` | String(36) | Yes | Requesting actor. |
| `acceptedAt` | Datetime UTC | Conditional | Required on acceptance. |
| `acceptedByAccountId` | String(36) | Conditional | Verified recipient actor. |
| `priorOwnerType` | Enum | Conditional | `account` or `assembly_role`, if previously assigned. |
| `priorOwnerKey` | String(64) | Conditional | Previous owner identity at handoff. |
| `resolvedAt` | Datetime UTC | Conditional | Required on resolution. |
| `resolutionCode` | Enum | Conditional | Approved resolution code. |
| `revision` | Integer | Yes | Positive referral version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `care_pauses`

Records agreed periods, such as travel, when automatic absence flags and reminders are suppressed. A pause does not rewrite attendance, cancel appointments, or delete case history.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `subjectId` | String(36) | Yes | Reference to `care_subjects.$id`. |
| `fromOn` | String(10) | Yes | Inclusive local start, `YYYY-MM-DD`. |
| `throughOn` | String(10) | Yes | Inclusive local end; cannot precede `fromOn`. |
| `timezone` | String(64) | Yes | IANA timezone for pause evaluation. |
| `reasonCode` | Enum | Yes | `travel`, `family_commitment`, `other_approved_absence`. |
| `state` | Enum | Yes | `active`, `ended`, `cancelled`; active-now also requires the date to be within range. |
| `recordedAt` | Datetime UTC | Yes | Creation time of the pause decision. |
| `recordedByAccountId` | String(36) | Yes | Recording actor. |
| `endedAt` | Datetime UTC | Conditional | Explicit resume/end time. |
| `endedByAccountId` | String(36) | Conditional | Human resume/end actor; absent for natural system expiry. |
| `revision` | Integer | Yes | Positive pause version. |
| `lastOperationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |

## `care_events`

Provides the action history: who performed an action, when, and which state or ownership changed. It stores allow-listed metadata and record references, not private note bodies.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `subjectId` | String(36) | Conditional | Related `care_subjects.$id`. |
| `caseId` | String(36) | Conditional | Related `care_cases.$id`. |
| `entityType` | Enum | Yes | Approved target entity type. |
| `entityId` | String(36) | Yes | Affected record ID. |
| `eventType` | Enum | Yes | Approved event, e.g. `note_recorded`, `plan_changed`, `referral_accepted`, `pause_started`, `case_closed`, `policy_changed`. |
| `actorKind` | Enum | Yes | `account`, `system`. |
| `actorKey` | String(64) | Yes | Validated Auth account ID or automation identity. |
| `occurredAt` | Datetime UTC | Yes | Event time. |
| `operationId` | String(36) | Yes | Reference to committed `care_commands.$id`. |
| `entityRevision` | Integer | Conditional | Relevant committed target revision. |
| `fromState` | Allow-listed string/enum | No | Previous state code. |
| `toState` | Allow-listed string/enum | No | Resulting state code. |
| `reasonCode` | Enum | No | Approved transition reason. |
| `fromOwnerType` | Enum | No | Previous `account` or `assembly_role` type. |
| `fromOwnerKey` | String(64) | No | Previous owner key. |
| `toOwnerType` | Enum | No | New `account` or `assembly_role` type. |
| `toOwnerKey` | String(64) | No | New owner key. |
| `relatedRecordId` | String(36) | No | Related note, plan, referral or attendance decision. |

## `care_commands` (operational receipts)

Tracks server operations, retries, and committed results. Receipts support deduplication and recovery across related writes, but do not by themselves guarantee atomic execution and must not contain raw private notes.

| Field | Type | Required | Values / constraints |
|---|---|---|---|
| `subjectId` | String(36) | Conditional | Related `care_subjects.$id`; absent for assembly-level commands. |
| `actorKind` | Enum | Yes | `account`, `system`. |
| `actorKey` | String(64) | Yes | Authenticated account or approved automation identity. |
| `commandType` | Enum | Yes | Approved server operation. |
| `requestDigest` | String(64) | Yes | Server-keyed digest of the canonical request; no raw private payload. |
| `expectedSubjectRevision` | Integer | Conditional | Subject coordination precondition. |
| `expectedEntityRevision` | Integer | Conditional | Target entity/policy version precondition. |
| `status` | Enum | Yes | `queued`, `applying`, `committed`, `failed`. |
| `targetIds` | String(36)[] | No | Server-derived IDs for operation records. |
| `resultId` | String(36) | No | Final result record ID. |
| `errorCode` | Enum | No | Sanitized failure code. |
| `attemptCount` | Integer | No | Non-negative recovery-attempt count. |
| `expiresAt` | Datetime UTC | Conditional | Cleanup time for completed receipts; not while in flight. |

## Proposed keys and indexes

Lookup and uniqueness definitions for the collections above; this is not a separate collection.

| Collection | Kind | Fields / key |
|---|---|---|
| `service_occurrences` | Unique | `assemblyId, groupKey, localDate` |
| `service_occurrences` | Key | `assemblyId, groupKey, lifecycle, registerState, localDate` |
| `attendance_expectations` | Unique | `assemblyId, memberDocumentId, groupKey, fromOn` |
| `attendance_decisions` | Unique | `assemblyId, occurrenceId, memberDocumentId, decisionRevision` |
| `attendance_decisions` | Key | `assemblyId, memberDocumentId, occurrenceId, decisionRevision DESC` |
| `follow_up_policies` | Unique | `assemblyId` |
| `care_subjects` | Unique | `assemblyId, subjectType, subjectDocumentId` |
| `care_subjects` | Key | `assemblyId, subjectType, flagState` |
| `care_subjects` | Key, non-unique | `assemblyId, activeCaseId` |
| `care_cases` | Key | `assemblyId, status, openedAt` |
| `care_cases` | Key | `assemblyId, ownerType, ownerKey, status` |
| `care_cases` | Key | `subjectId, openedAt` |
| `care_plans` | Key | `assemblyId, status, scheduledAt` |
| `care_plans` | Key | `caseId, status, scheduledAt` |
| `care_plans` | Key | `assemblyId, assigneeType, assigneeKey, status, scheduledAt` |
| `care_notes` | Key | `caseId, happenedAt` |
| `care_notes` | Key | `assemblyId, readerPolicyKey` |
| `care_referrals` | Key | `assemblyId, recipientType, recipientKey, state, requestedAt` |
| `care_referrals` | Key | `caseId, state` |
| `care_pauses` | Key | `subjectId, state, fromOn` |
| `care_pauses` | Key | `assemblyId, state, throughOn` |
| `care_events` | Key | `caseId, occurredAt` |
| `care_events` | Key | `assemblyId, subjectId, occurredAt` |
| `care_events` | Key | `operationId` |
| `care_commands` | Deterministic primary ID | Hash of actor kind/key, assembly, command type and request key. |
| `care_commands` | Key | `assemblyId, status, $createdAt` |
