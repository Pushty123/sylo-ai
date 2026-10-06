MODELS={"funded":"PAID PROJECT. Milestone payments are held in escrow before work starts and released on acceptance.","stipend":"STIPEND PROJECT. A fixed amount is paid, plus credit.","knowledge_sharing":"UNPAID PROJECT. There is NO payment. Rewards are certificates, badges, co-authorship, mentorship and recommendation letters.","institutional_credit":"UNPAID PROJECT. There is NO payment. The institution grants project or course credit."}
def default_terms(model="funded",budget=0):
    paid=model in ("funded","stipend")
    return {
"1_engagement_model":MODELS.get(model,MODELS["funded"]),
"2_rewards":f"Total budget ₹{budget:,}, paid per milestone after acceptance." if paid else "No money is promised or implied. Accepted contributions earn verifiable certificate and credit.",
"3_scope":"Work is split into milestones with measurable deliverables and acceptance criteria.",
"4_people":"Roles, eligibility and expected weekly time are listed per role. Only verified members may join.",
"5_ip_and_publication":"Contributors keep credit and co-authorship. IP and publication follow the written project terms.",
"6_confidentiality":"Confidential project data stays on the platform and is never sent to external AI.",
"7_credit_and_reward_split":"AI earns nothing; human contribution credit follows the reviewed impact recorded in the ledger.",
"8_exit_and_disputes":"Anyone may leave and keeps full credit for accepted work. Sponsor silence after 7 days of a passed review auto-accepts the milestone.",
"9_future_commercialisation":"Future commercialisation follows the agreed IP/payment terms; unpaid work receives a fair share or paid licence offer.",
"10_changes_to_this_charter":"Never changed silently. A change creates a new version, notifies members, and pauses work until re-acceptance.",
"11_ai_use":"AI use is declared and logged under a human owner. The human receives credit; AI receives none.",
"12_integrity":"Uploads are fingerprinted and checked for similarity. Copying or leakage is recorded in the ledger."}
def default_role_terms(model="funded"):
    paid=model in ("funded","stipend")
    return {
"student":{"duties":"Deliver assigned milestone work and declare AI use.","rewards":"Payment and credit." if paid else "Certificate, credit and co-authorship.","time":"Default 8–10 hours/week.","minors":"Under-18 participants need guardian consent before paid work."},
"expert":{"duties":"Review only against agreed criteria.","conflict_of_interest":"Declare sponsor/competitor conflicts; conflicted experts cannot review.","credit":"Credit only for logged guidance and reviews.","rewards":"Expert share." if paid else "Mentorship credit where earned.","review_time":"Review within 3 days."},
"sponsor":{"funding":"Fund each paid milestone into escrow before work starts." if paid else "No payment required.","acceptance":"Review within 7 days; rejections cite a failed criterion.","use_of_work":"Do not use deliverables before acceptance." + (" and payment." if paid else ".") ,"privacy":"Only necessary contributor identity/skills are visible.","placements":"Placement promises count only if written in the charter."},
"admin":{"duties":"Verify, enforce the charter and mediate neutrally.","ledger":"Never edit ledger/payment records; corrections are new signed entries."}}
