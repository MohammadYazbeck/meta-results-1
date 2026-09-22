# Meta Ads Diagnosis Rulebook V2

## 1. Purpose and safety boundary

This rulebook converts Meta Ads delivery and performance data into explainable diagnoses and recommended actions. It is a decision-support system, not an autonomous media buyer.

- Preserve the hierarchy: `Client → Campaign → Ad Set → Ad → Day`.
- Diagnose every level separately.
- Delivery status always comes before performance.
- Never combine unlike result types or optimization goals.
- Never infer exact results from `spend ÷ rounded CPR`.
- Never execute pause, activation, budget, targeting, or creative changes without explicit human approval.
- When live data is unavailable, show a blocking warning; sample data cannot support current decisions.
- Clients without CRM or sales data can be rated for Meta outcome efficiency, not business profitability.

## 2. Evidence classification

Every rule must carry one of these sources:

1. **Proven rule** — platform semantics, controlled experiments, or required data safeguards.
2. **Account-calibrated rule** — learned from comparable historical data for this client and result type.
3. **Practitioner heuristic** — useful starting threshold supported by field practice but not universally proven.

Thresholds marked as heuristics must be editable per client and recalibrated after live observation.

## 3. Required data model

### Client configuration

- `client_id`, `client_name`, campaign-name matching rule.
- `primary_result_type`: messages, leads, profile visits, followers, purchases, engagement, etc.
- `target_cpr`: healthy commercial cost per result.
- `maximum_cpr`: highest acceptable cost before pause review.
- `minimum_results_early`: default 3.
- `minimum_results_firm`: default 5.
- `minimum_results_scale`: default 10.
- `normal_daily_capacity`, `maximum_daily_capacity`.
- `operating_hours` and intentional schedules.
- `message_quality`: good, mixed, poor, unknown.
- `scaling_permission`: always requires approval.
- `last_budget_change_at`, `last_budget_change_percent`.
- active/inactive client flag and reporting destination.

### Entity and daily performance data

For campaigns, ad sets, and ads, store:

- ID, name, parent IDs, client ID.
- Objective and optimization goal.
- Configured status, effective status, and delivery status/substatus.
- Spend, daily/lifetime budget.
- Exact result count and exact result/action type.
- CPR, impressions, reach, frequency, CTR, link/outbound CTR.
- Clicks, unique link clicks, CPC, CPM.
- Video 25/50/75/100% retention when applicable.
- Attribution setting/window.
- Start/end dates, reporting date, timezone.
- Previous equal-period metrics.
- Status, budget, schedule, rejection, billing, and activity-log changes.

Do not store a result number without its result type. `20,000 results` is meaningless unless the system says whether they are profile visits, conversations, leads, or another action.

## 4. Required calculations

```text
CPR = Spend ÷ Exact results
CTR = Clicks ÷ Impressions × 100
CPM = Spend ÷ Impressions × 1,000
Frequency = Impressions ÷ Reach
Results per 1,000 impressions = Exact results ÷ Impressions × 1,000
Reach per spend = Reach ÷ Spend
Click-to-result index = Exact results ÷ Unique link clicks × 100
Percent change = (Current − Previous) ÷ Previous × 100
```

The click-to-result value is a diagnostic index, not a guaranteed conventional conversion rate. Meta result attribution and unique-link-click attribution can differ, so it may exceed 100%. Calculate it only from exact results; never estimate results from rounded CPR.

## 5. Comparable baselines

Comparison order:

1. Same client + same optimization goal/result type + comparable attribution window.
2. Same client + previous comparable period.
3. Account-wide same optimization goal as fallback, clearly labeled.
4. No comparable data → `Insufficient comparison data`.

Use medians rather than averages to reduce distortion from outliers. Never compare messages with profile visits, leads with engagement, or campaigns with mixed optimization goals.

Calibration strength:

- Temporary: 14 complete days and at least 10 results.
- Reliable: 30–60 complete days and at least 30 results.
- Strong: 90 days and at least 100 results.

## 6. Decision pipeline

Run rules in this exact order:

1. Validate data freshness, source, timezone, and attribution consistency.
2. Resolve client from campaign name/configuration.
3. Read campaign delivery.
4. Read every ad-set delivery state.
5. Read ads only within the relevant ad sets.
6. Apply minimum-data safeguards.
7. Build comparable baselines.
8. Diagnose current performance.
9. Compare equal periods for trends.
10. Calculate confidence and priority.
11. Generate an operator recommendation and client-facing explanation.
12. Require approval for consequential actions.

## 7. Delivery-status rules

Use the provider's true delivery/effective status, not only the configured ON/OFF toggle.

- `ACTIVE` with active child delivery → evaluate performance.
- Configured active but no active ad set/ad, zero delivery, blocking substatus, rejection, billing issue, or ended schedule → `Delivery issue`.
- `PAUSED`, `OFF`, `COMPLETED`, or ended → historical/offline; do not give current winner/weak labels.
- Parent active while child completed/paused → child delivery status wins for that child.
- Active ads must belong to an active ad set inside an active campaign to be treated as a live branch.

Priority traversal counts only current active branches. Paused historical ads must not generate red high-priority alerts.

## 8. Minimum-data safeguards

Use two stages:

### Early signal

```text
Impressions ≥ 1,500
AND exact results ≥ 3
```

May support an initial diagnosis, normally Low or Medium confidence. It must not authorize scaling or pausing by itself.

### Firm judgment

```text
Impressions ≥ 3,000
AND unique link clicks ≥ 30 when relevant/available
AND exact results ≥ 5
```

If the result journey does not use a link click, the click requirement is not applicable rather than failed.

If exact results are unavailable, do not issue a firm CPR, winner, weak, pause, conversion, or scale judgment. Show the limitation.

## 9. Campaign-level diagnoses

Campaign diagnosis covers structure and delivery, not exact creative quality.

### Delivering normally

- Campaign delivery active.
- At least one active ad set and active ad are delivering.
- No blocking delivery condition.

Action: Continue to ad-set and ad diagnoses.

### Partially delivering

- Campaign active.
- Some ad sets are active and others paused/completed/offline.

Action: Confirm inactive branches are intentional; diagnose active branches only.

### Delivery issue

- Campaign active but zero measurable impressions/spend in the reporting period; or
- No active ad set/ad branch; or
- Blocking error/status exists.

Action: Inspect parent/child status, schedule, review, billing, bid/cost controls, budget, and activity logs.

### Not delivering

- Campaign paused, off, completed, ended, or intentionally inactive.

Action: Record as historical; confirm intent if it was expected to run.

### Mixed optimization

- More than one optimization goal/result type exists in the campaign.

Action: Suppress campaign-level CPR and result diagnosis. Summarize each compatible ad-set group separately.

### Delivery concentration

- Most current spend/results are concentrated in one active ad set.

Action: Informational unless concentration causes insufficient learning or contradicts intended allocation.

## 10. Ad-set diagnoses

Ad-set diagnosis covers delivery, audience, optimization, budget, and conversion health.

### Insufficient comparison data

- Delivery data exists but no comparable same-goal baseline exists.

Action: Continue collecting data; do not diagnose audience quality.

### Likely creative fatigue

Require an equal-period trend:

```text
Frequency rising
AND CTR falls ≥20%
AND CPR worsens ≥20%
```

Frequency alone never proves fatigue.

Action: Refresh hook, visual, format, or offer while preserving the audience test.

### Audience too expensive or too narrow

Starting rule: require at least four supporting signals:

- CPM ≥25% worse than comparable baseline.
- Reach per spend ≥25% worse.
- Frequency ≥20% higher/rising.
- CTR remains acceptable (not more than 20% worse), so attention is not the main failure.
- CPR ≥20% worse.

Action: Review audience size, overlap, geography, restrictions, placements, and auction conditions.

### Creative issue across the ad set

```text
CTR ≥20% worse than comparable baseline
AND CPR ≥20% worse
```

Supporting evidence: CPC worse, poor early video retention, most ads weak.

Action: Inspect individual ads; replace weak hooks/creative rather than immediately changing audience.

### Good attention, weak conversion to result

```text
CTR no more than 10% below baseline
AND click-to-result index ≥20% worse
```

Action: Review offer, CTA, price, trust/profile, message flow, automatic replies, destination, timing, and lead quality.

### Healthy — possible budget increase

```text
CPR ≥20% better than comparable baseline
AND CTR no more than 10% worse
AND spend <75% of comparable median
```

This is only an opportunity signal. Scaling still requires the full scaling gate below.

### Healthy

- Enough data.
- No combined audience, creative, conversion, fatigue, or delivery rule triggers.

Action: Continue; diagnose individual ads.

## 11. Ad-level diagnoses

Compare ads primarily with ads in the same ad set, because they share audience and optimization conditions.

### No delivery yet

- Ad configured active but spend or impressions are zero.

Action: Check review, schedule, parent delivery, and whether serving has begun.

### Historical labels

For paused/completed ads with data:

- CPR ≥20% better than benchmark → `Historical winner`.
- CPR ≥25% worse → `Historically weak`.
- Otherwise → `Historically healthy`.

These are never presented as current operational winners or weak ads.

### Winner

```text
Firm data reached
AND CPR ≥20% better than same-ad-set benchmark
AND CTR no more than 20% worse
AND trend stable or improving
AND no fatigue
```

Action: Keep running; scaling requires the separate scale gate.

### Healthy

```text
CPR within approximately ±20% of benchmark
AND no material negative trend
```

Action: Continue and reassess.

### Weak

```text
Firm data reached
AND CPR ≥25% worse than same-ad-set benchmark
AND at least one supporting signal is weak
```

Supporting signals: low CTR, low result index, poor video retention, worsening trend.

Action: Review for replacement or pause; human approval required.

### Creative is not getting attention

```text
CTR ≥20% worse
AND (CPR ≥25% worse OR early video retention ≥20% worse)
```

Action: Replace hook, opening visual, or format after review.

### Good attention, weak conversion

```text
CTR no more than 10% below benchmark
AND click-to-result index ≥20% worse
```

Action: Review offer/CTA/trust/message experience before replacing the hook.

### Likely creative fatigue

Same multi-signal trend rule as the ad-set level. Require deterioration across equal periods, not a single bad day.

## 12. Trend rules

Compare completed equal periods: default recent 3 days vs previous 3 and recent 7 days vs previous 7. Do not compare partial today with a complete previous day.

- **Improving:** CPR improves ≥15% and results are stable/increasing.
- **Stable:** CPR changes <15% and results do not decline ≥20%.
- **Declining:** CPR worsens ≥20% and CTR falls ≥15%.
- **Fatigued:** frequency rises, CTR falls ≥20%, CPR worsens ≥20%.
- **Delivery drop:** spend falls ≥30% and impressions or results fall ≥30% while entity remains active.
- **Scaling successfully:** spend rises ≥20%, CPR stays within 15%, results increase.
- **Scaling inefficiently:** spend rises ≥20% and CPR worsens >15–20%.
- Missing equal-period data → `Insufficient trend data`.

## 13. Pause-candidate rules

These are practitioner starting heuristics and must use the client's acceptable CPR.

### Zero-result loss limit

```text
Spend ≥2 × maximum acceptable CPR
AND exact results = 0
```

### Persistent expensive results

```text
Exact results ≥5
AND CPR ≥150% of target CPR
AND condition persists for 3 complete days
```

### Confirmed fatigue

Multi-signal fatigue persists across equal periods and replacement creative is available.

Output: `Pause candidate — approval required`. Never auto-pause from one bad day, CPM alone, CTR alone, or frequency alone.

## 14. Scale-candidate rules

All gates must pass:

- Campaign, ad set, and ad delivery are healthy.
- Optimization/result type is comparable.
- At least 10 exact results in the evaluation window.
- CPR is at or below client target.
- Last 3 complete days stable or improving.
- No fatigue, delivery issue, or tracking limitation.
- Message/lead quality confirmed acceptable.
- Client/team capacity confirmed.
- No recent unassessed budget change.
- Human approval available.

Recommended controlled test:

```text
Increase budget 10–20%
Record exact change time and percentage
Wait 3 complete days
Compare result volume, CPR, quality, and capacity
```

- Results increase and CPR remains within 15% → `Scaling successfully`.
- CPR worsens >15–20% → `Scaling inefficiently`; stop further increases and review.

The 10–20% step is a practitioner heuristic, not a universal Meta guarantee.

## 15. Confidence and priority

### Confidence

- **High:** firm data plus at least 3 independent supporting signals, aligned attribution, reliable baseline.
- **Medium:** early/firm data plus 2 supporting signals, or some limitation.
- **Low:** 1 signal, insufficient data, missing exact results, weak baseline, or conflicting metrics.

Confidence describes certainty, not severity.

### Priority

- **High:** delivery block, persistent conversion issue, confirmed fatigue, weak creative with firm evidence, pause candidate, inefficient scaling.
- **Medium:** insufficient data requiring follow-up, possible budget increase, partial delivery, calibration needed.
- **Low:** healthy/stable, historical context, informational status.

Red numbered alerts roll up only active high-priority branches: ad → ad set → campaign. Historical/paused entities are excluded.

## 16. Recommendation mapping

- Healthy + stable → Continue.
- Healthy + improving → Continue and monitor.
- Winner + stable → Keep running.
- Winner/healthy + full scale gate → Controlled scaling candidate.
- Promising/insufficient → Collect data; do not pause or scale.
- Weak + high confidence → Replace or pause after approval.
- High CTR + low result conversion → Review offer, CTA, trust, destination/message flow.
- Low CTR + good conversion quality → Improve hook/opening while preserving offer.
- Low CTR + low conversion → Replace creative and review offer.
- Audience issue → Review size, overlap, geography, placements, and restrictions.
- Fatigue → Rotate/refresh creative.
- Delivery drop → Investigate account, parent status, schedule, budget, billing, review, bid controls.
- Scaling inefficiently → Stop further increases; assess latest change.
- Offline/no delivery → Confirm intent/status; do not judge performance without data.

## 17. Client-facing reporting

Internal and client language must be separate. The internal report may include thresholds and uncertainty; the client message should be concise and non-technical.

Final report order:

1. Executive summary.
2. Campaign delivery diagnosis.
3. Every ad-set diagnosis.
4. Active ad diagnoses.
5. Paused historical benchmarks.
6. 3-day and 7-day trends.
7. Confidence and evidence.
8. Recommendations by priority.
9. Arabic client-facing recommendation.
10. Data limitations and approval status.

Every action record should include:

```text
recommended_action
reason
priority
confidence
evidence_class
evidence[]
data_window
limitations[]
execution_status = awaiting_approval | approved | rejected | executed
```

## 18. Daily automation workflow

```text
Fetch completed-day data
→ Validate freshness and exact result types
→ Normalize Client/Campaign/Ad Set/Ad/Day
→ Run delivery-first diagnosis
→ Compute 3-day, 7-day, and historical comparisons
→ Generate operator and Arabic client messages
→ Put high-risk messages in approval inbox
→ Send approved messages
→ Record sent/delivered/read/failed status
```

Automatically eligible messages: healthy/stable summaries, insufficient-data notices, factual delivery warnings. Pause, scale, creative criticism, and audience changes require operator approval.

For WhatsApp, use the official WhatsApp Business Platform/Cloud API with approved templates and consent/opt-out handling. Do not automate a personal WhatsApp account.

## 19. Implementation acceptance tests

The transferred system is correct only if it passes these tests:

- Mixed result types suppress campaign CPR.
- Completed ad set is not shown as active even if configured status is ON.
- Paused historical winner does not appear as current winner.
- Active ad with zero current delivery becomes `No delivery yet`, not `Weak`.
- Missing exact results suppresses click-to-result, winner, weak, pause, and scale claims.
- Frequency increase alone does not trigger fatigue.
- A weak ad inside a healthy shared ad set becomes an ad-level creative issue, not an audience issue.
- Different clients are never merged because of account-level auction-overlap advice.
- A scale recommendation is blocked when capacity or message quality is unknown.
- A pause/scale recommendation never executes without approval.
- High-priority counts include only active branches.
- `Results per 1,000 impressions` always names the underlying result type.

## 20. Recommended build sequence for another system

1. Create normalized schemas and client settings.
2. Build provider adapter and exact result-type mapping.
3. Implement delivery-state resolver.
4. Implement data sufficiency and comparison grouping.
5. Implement campaign rules.
6. Implement ad-set rules.
7. Implement ad rules.
8. Implement trends, evidence class, confidence, and priority.
9. Implement pause/scale gates.
10. Implement explainable reports and approval inbox.
11. Shadow-test on live data for at least one week.
12. Calibrate thresholds per client/result type.
13. Only then connect approved outbound messaging.

