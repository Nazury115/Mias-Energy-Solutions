"""Record narrated tutorials of the current local app using isolated fictional data.

Requires the existing Playwright test environment, its ffmpeg browser tool,
imageio-ffmpeg, Pillow, NumPy and the installed Windows English speech voice. Run a separate
development server on port 3300 with its own MIAS_DB_DIR before recording.
No application sources, real accounts or live messaging transports are changed.
"""
import argparse
import base64
import hashlib
import html
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import urlopen
import wave

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:3300"
OUT = ROOT / "training-videos/2026-10-29"
PRIVATE = ROOT / ".data/tutorial-008"
FLAGS = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
EMAIL = {role: f"training-{role}@example.com" for role in ["owner", "staff", "colleague", "customer", "guest", "newcolleague"]}
NAMES = {"owner": "Training Owner", "staff": "Training Staff", "colleague": "Training Colleague", "customer": "Training Customer", "guest": "Training Guest"}
PASSWORD = "training river lantern at sunrise"
NEW_PASSWORD = "training meadow copper at sunset"
STEPS = []


def S(key, group, chapter, title, instruction, narration):
    STEPS.append(dict(key=key, group=group, chapter=chapter, title=title, instruction=instruction, narration=narration))


S("intro", "intro", "Start here", "Current-system walkthrough",
  "Fictional training data • Local preview • Use the chapter list to revisit any task",
  "Welcome to the Mias Energy Solutions system walkthrough. We will follow a request from the customer, through staff review, into a private job portal. Every account and job in this recording is fictional training data. This is the current local preview. Email and text messages are captured locally; no real messages are sent.")
S("public_services", "customer", "Explore the public website", "Find the right service",
  "Home → Services → choose a service family",
  "You can browse the website without an account. Open Services to explore water, electrical, renewable energy, and solar water pumping. Open a service page for its scope and useful questions. Prepare an inquiry carries the chosen service into the Contact form. About Mias provides the business information currently supplied.")
S("public_projects", "customer", "Explore the public website", "Projects and coverage",
  "Select a province; filter the project stories; open an example",
  "On Projects, select a province on the map or in the province list. The detail panel changes with your selection, and its discussion link carries the area into Contact. Filter project stories by service and open a story to read it. The current map figures and fictional example stories are labelled sample content, not verified completed projects.")
S("public_photos", "customer", "Explore the public website", "Use the photo viewer",
  "Select a work photo → Next / Previous → Close",
  "Select a photo in the work gallery to enlarge it. Use Next and Previous, or the arrow keys, to browse. Close the viewer to return to the page. The work gallery contains supplied work photographs; illustrative stock images elsewhere are separate. For direct contact, the phone, email, and WhatsApp links open their corresponding applications.")
S("contact_validation", "customer", "Send a request without an account", "Start an inquiry",
  "Contact → enter your name, contact details and project information",
  "Open Contact and fill in your name, phone or email, the preferred reply method, service, area if known, and project details. If something required is missing, the form highlights the problem and keeps your entries. Your preferred reply method tells the team how to follow up; it is separate from automated receipt notifications.")
S("contact_whatsapp", "customer", "Send a request without an account", "Optional WhatsApp preparation",
  "Prepare WhatsApp message → review the text before opening WhatsApp",
  "Prepare WhatsApp message creates text for you to review. It does not send a message or save an inquiry by itself. Open WhatsApp only when you are ready to send through that application. We will not contact anyone in this tutorial. To save the request in this system, use Send inquiry to Mias.")
S("contact_send", "customer", "Send a request without an account", "Save the request and keep its reference",
  "Send inquiry to Mias → keep the MES reference",
  "Submit the inquiry and wait for the confirmation. Keep the M E S reference for follow-up. Receipt means the request was saved; it is not acceptance of the work or an appointment. Supplied email and phone details are used for receipt notifications. In this local preview, those notifications appear in the development inbox.")
S("signup", "customer", "Create and maintain your account", "Create a customer account",
  "Sign in → Create an account → fill the registration form",
  "To create a customer account, choose Create an account from Sign in. Enter your name and email, optionally add a phone number, and choose a strong password of at least ten characters. Ordinary registration creates a customer account. Company Staff and Owner accounts are created through invitations.")
S("confirm_resend", "customer", "Create and maintain your account", "Confirm your email",
  "Open the confirmation email; use Send the link again if needed",
  "After registration, open the email confirmation link. If you try to sign in before confirmation, the site offers Send the link again. Check your spam folder in real use. For this local training copy we retrieve the captured link from the development inbox behind the scenes. Confirmation alone does not sign you in.")
S("customer_login", "customer", "Create and maintain your account", "Sign in and understand My account",
  "Enter your email and password → Sign in",
  "Sign in with the confirmed email address and password. My account shows your profile, your linked jobs, and inquiries you sent while signed in. A matching email on a guest inquiry does not automatically grant job access. The team must send an invitation, and you must accept it.")
S("customer_profile", "customer", "Create and maintain your account", "Update your profile",
  "My account → Your details → Save details",
  "Under Your details you can update your name and phone number, then select Save details. This does not change your account email. The same profile controls are available to company users through My account. Use the displayed success message to confirm the change was saved.")
S("signed_request", "customer", "Create and maintain your account", "Send an inquiry while signed in",
  "Contact is prefilled; send the request, then check Your inquiries",
  "When you open Contact while signed in, your saved contact details are filled in for you. Review them, describe the work, and submit. This request now appears under Your inquiries in My account. Jobs are a separate list: a job appears there only after staff give this account access.")
S("staff_login", "staff", "Staff access and workspace", "Sign in as Staff",
  "Accept the staff invitation, set a password, then use Sign in",
  "An Owner invites a staff member by email. The staff member opens the single-use invitation and chooses a password; the link normally expires after seven days. This training Staff account has already completed that setup. Sign in to reach Inquiries and Jobs. Staff cannot manage the company team; that is an Owner function.")
S("staff_search", "staff", "Review and accept an inquiry", "Find and open the request",
  "Inquiries → search → Review / accept or the MES reference",
  "Search Inquiries by reference, name, email, or phone number. Clear the search to return to the newest requests. Select the M E S reference to read the full details. Review slash accept is the shortcut to the acceptance form, and Accept request near the top of the detail page reaches the same form.")
S("staff_review", "staff", "Review and accept an inquiry", "Record the review status",
  "Review request → status + reason → Save review",
  "Before acceptance, choose Received, Under review, Awaiting information, or Closed, and record a review reason. Save review. A closed inquiry cannot be accepted until its review status is reopened. These statuses organize the request review; they do not create a job or automatically grant customer access.")
S("staff_accept", "staff", "Review and accept an inquiry", "Accept and create the job",
  "Fill agreed scope, next step, responsible staff and reason",
  "After the work has been agreed, complete Agreed scope, Next step, Responsible staff, and the private acceptance reason. Select Accept and create job. The system creates one linked job with a J O B reference and opens its management page. Receipt and acceptance notifications are separate, and acceptance still does not grant portal access.")
S("staff_jobs", "staff", "Manage the job", "Find jobs and follow the original inquiry",
  "Jobs → search or filter by stage → open a JOB reference",
  "The Jobs list supports searching by reference or agreed work, and filtering by stage. Open a job reference to manage it. The overview shows the stage, agreed scope, next step, and responsible staff. Original inquiry returns to the saved request. An accepted inquiry also has an Open job link.")
S("staff_workflow", "staff", "Manage the job", "Update work, assignment and stage",
  "Manage job → edit fields + reason → Update job",
  "Use Manage job to revise the agreed scope, next step, responsible staff, or stage. Every save requires a reason, retained for staff. The approved local stages are Assessment, Awaiting quotation decision, Scheduled, In progress, and Completed, plus On hold and Cancelled. Awaiting quotation decision is a workflow stage; quotation documents are not built yet.")
S("staff_hold", "staff", "Manage the job", "Put work on hold and resume it",
  "Choose On hold with a reason; resume at an allowed active stage",
  "Move a nonterminal job to On hold when work pauses, with an explanatory reason. Resume it at an allowed active stage when ready. The system checks transitions, and also rejects an edit based on an old record version. If another person changes the job first, reload and reconcile the saved information before retrying.")
S("staff_invite_existing", "staff", "Give the customer portal access", "Invite the reviewed customer",
  "Customer access → verify name/email → tick the identity check → Invite customer",
  "In Customer access, check the customer's identity and the intended email address. Confirm that check and select Invite customer. The email contains a seven-day setup link. This is a separate step from accepting the request. Existing customers must sign in with that matching verified email and explicitly accept the invitation.")
S("customer_existing_access", "customer", "Accept your portal invitation", "Existing customer: accept access",
  "Open the invitation → sign in with the invited email → Accept job access",
  "If you already have an account, open the invitation while signed in with the invited email, or use Sign in to accept. Select Accept job access. The job is now linked to your account. An invitation for a different email must not be accepted under your current login; sign out and use the intended account.")
S("customer_job", "customer", "Use your private job portal", "Read the job and send a message",
  "My account → Your jobs → JOB reference → Message to Mias",
  "Open Your jobs in My account, then the job reference. Read the agreed work, stage, next step, dated history, and customer-visible messages. Times are labelled in Zambia time. Send questions using Message to Mias and wait for the saved confirmation. Only jobs explicitly linked to your account appear here.")
S("staff_communications", "staff", "Communicate and keep private notes", "Read and reply to customer messages",
  "History → customer reply; Message to customer → Send message",
  "Customer replies appear in the job history. Use Message to customer to respond, and Publish update for a customer-facing progress announcement. These communications stay in the portal. The current workflow does not automatically send an email or text for each progress update or message.")
S("staff_private", "staff", "Communicate and keep private notes", "Save an internal note",
  "Internal note → Save private note; read the dated history",
  "Use Internal note for staff-only information and Save private note. Private notes and change reasons are kept separate from customer-visible updates. History records their actor and time for authorized staff. Do not put a confidential staff note into the public update or customer-message fields.")
S("customer_progress", "customer", "Use your private job portal", "Follow updates and reply",
  "Refresh the job to read new progress; reply in the message form",
  "Return to the job or refresh it to see the latest stage, next step, updates, and staff reply. The customer's view omits internal staff notes. You can respond in the same job conversation. If several jobs are linked to your account, open the relevant job before sending its message.")
S("staff_guest_job", "staff", "Give the customer portal access", "Accept a guest request too",
  "Accept the guest inquiry, then send its separate customer invitation",
  "A guest request follows the same staff review and acceptance process. A phone-only request can be saved, but this account system needs an email address before portal access can be invited. Here we accept the earlier guest request and invite its reviewed email address. The recipient does not already have an account.")
S("customer_new_access", "customer", "Accept your portal invitation", "New customer: set up from the invitation",
  "Open invitation → Choose a password → Create account and open job",
  "For a new customer, the invitation offers Choose a password and Create account and open job. Completing it creates the customer account and grants access together. No password is sent in the invitation. The link works once. Keep using the normal Sign in page afterward.")
S("customer_isolation", "customer", "Use your private job portal", "Your job access stays private",
  "Your account opens only explicitly authorized jobs",
  "A different customer's job is unavailable even if you know its reference. The system checks access on the server and uses the same not-found response for an unknown or unauthorized job. A customer also cannot open the Staff workspace. This protects the work and conversations belonging to other customers.")
S("staff_invite_controls", "staff", "Control and revoke customer access", "Cancel and replace a pending invitation",
  "Cancel pending link; resend only after reviewing the destination",
  "On this secondary training job, we first revoke the previously accepted association. Staff can then issue a fresh reviewed invitation. Sending a replacement cancels the earlier pending link; Cancel customer invitation cancels the current pending link. Invitation creation is rate limited, so review the destination before sending again.")
S("staff_delivery", "staff", "Notifications and delivery", "Read each notification's delivery state",
  "Notification delivery → inspect each channel and retry eligible failures",
  "Notification delivery lists receipt, acceptance, and invitation events independently, with their channel and attempts. In this preview Captured locally is the honest success label. Eligible failed messages can be retried up to four attempts. A sending or unknown outcome requires review rather than a blind resend. Real provider delivery is not connected yet.")
S("staff_finish", "staff", "Complete or cancel work", "Complete the main job",
  "Scheduled → In progress → Completed, recording a reason",
  "Move the job through the allowed stages as the work progresses. Complete it when the work is finished, recording the reason and final next step. Completed and Cancelled are terminal in this build: the workflow form closes, while the job history and authorized conversations remain available.")
S("staff_cancel", "staff", "Complete or cancel work", "Cancel a separate training job",
  "Choose Cancelled with a reason; retain the history",
  "Use Cancelled when a nonterminal job will not proceed, and record why. Cancellation retains the inquiry and job history. It is a different action from revoking customer portal access. Use the correct action for the actual business decision, rather than deleting the records.")
S("staff_revoke", "staff", "Control and revoke customer access", "Revoke linked customer access",
  "Reason for revoking access → Revoke customer access",
  "To remove a customer's job association, enter the reason for revoking access and confirm Revoke customer access. The next customer request for that job is denied. The inquiry, job, messages, and staff history remain available to authorized company staff. A later association needs a fresh reviewed invitation.")
S("customer_revoked", "customer", "Use your private job portal", "Understand unavailable access",
  "If a job becomes unavailable, contact Mias; your account still exists",
  "If your job becomes unavailable after access is revoked, contact Mias rather than trying other references. Revoking one job does not delete your customer account. You can still sign in, maintain your details, and see any other jobs for which you retain access.")
S("account_recovery", "shared", "Password help and signing out", "Reset a forgotten password",
  "Forgot your password? → reset email → choose a new password",
  "Customers, Staff, and Owners use the same password recovery process. Select Forgot your password, enter your account email, and open the reset link. The response deliberately does not reveal whether an email is registered. In this local example we retrieve the captured email. Set a new password; existing sessions are signed out.")
S("account_signout", "shared", "Password help and signing out", "Sign in again and sign out safely",
  "Use the new password; Sign out when finished",
  "Sign in with the new password to confirm it works. Use Sign out when finished, especially on a shared device. Repeated incorrect passwords temporarily pause sign-in; use recovery rather than repeatedly guessing. Staff sessions expire sooner than customer sessions, so a new sign-in may be required.")
S("staff_profile", "staff", "Staff access and workspace", "Staff profile and sign-out",
  "My account → save your name/phone; return to the company workspace",
  "Staff can open My account to update their own name and phone number, then return to the company workspace. These profile controls do not change roles or team permissions. Use Sign out to end the current session. The password recovery chapter applies to Staff as well.")
S("owner_team", "owner", "Owner-only team administration", "Invite a company user",
  "Team → name, email and Staff/Owner role → Send invitation",
  "Only an Owner has Team management. Enter the person's name and email, choose Staff or Owner, and send the invitation. The recipient chooses their password from its single-use link. Customers should use customer registration or job invitations instead; do not give them a company role.")
S("owner_cancel", "owner", "Owner-only team administration", "Cancel an unaccepted team invitation",
  "Pending invitations → Cancel invitation",
  "Pending invitations show the intended account, role, and expiry. Cancel an unaccepted invitation if it was sent to the wrong person or is no longer needed. A cancelled link cannot create an account. If a replacement is appropriate, review the details and issue a new invitation.")
S("owner_roles", "owner", "Owner-only team administration", "Change a role",
  "People → select role → Change role",
  "In People, an Owner can change an existing company user's role. Owner grants team management and should be assigned deliberately. Here we change a fictional colleague's role and then restore Staff. Staff users cannot perform this operation themselves.")
S("owner_status", "owner", "Owner-only team administration", "Deactivate and reactivate a user",
  "People → Deactivate / Reactivate; review Recent changes",
  "Deactivate a company account to remove its access and end its sessions. Reactivate it when access should be restored. Recent changes records team administration. The system refuses to remove the last active Owner, so the company cannot accidentally lose all access to team management.")
S("local_inbox", "local", "Local testing tools", "Understand the development inbox",
  "Development-only: captured emails, texts and invitation links",
  "The development inbox is a local testing tool, not a customer or production Staff page. It contains the company inquiry notice, customer email and text captures, confirmation and reset emails, and invitation links. It also has a local Owner setup helper. This route and helper are unavailable in production mode.")
S("local_failure", "local", "Local testing tools", "Simulate notification failure and retry",
  "Simulate SMS failure → submit a training request → Normal",
  "For local testing, select Simulate SMS failure and submit a new fictional inquiry in the same browser. The email can succeed independently while the text shows failure. Restore Normal to allow eligible retries. Opening the inbox retries pending or failed captures within the attempt limit; successful channels are not sent again.")
S("local_db_failure", "local", "Local testing tools", "Test honest save failure and clean up",
  "Simulate database failure → verify retained form → restore Normal",
  "Simulate database failure checks that the visitor is told the request was not saved and their text remains available. Return to Normal afterward. The local inbox can delete an unlinked test inquiry. Inquiries already attached to jobs are retained with those jobs instead of being deleted by that helper.")
S("mobile", "customer", "Using a phone", "Open mobile navigation",
  "On a narrow screen, use the menu button to reach the same pages",
  "On a phone, open the menu button to reach the main navigation and account links. The same customer and staff functions remain available. Tables may scroll inside their own panel. This narrow-screen demonstration uses the same current site, not a separate mobile app.")
S("outro", "outro", "Finish", "What is and is not built",
  "Built: requests, accounts, jobs, messages and local captures",
  "You have now seen the current customer, Staff, and Owner workflows. Private uploads, shared company access, quotation and invoice generation, and the solar planner remain follow-up work. Real email, real text delivery, and public deployment are not enabled in this preview. Use the chapter guide and captions to repeat any task.")

OVERLAY = r"""
(() => {
  window.__tutorial = window.__tutorial || {};
  function ensure() {
    let root=document.getElementById('__training_overlay');
    if(!root) {
      root=document.createElement('div');root.id='__training_overlay';
      root.innerHTML='<div id="__training_top"></div><div id="__training_caption"><small></small><strong></strong><p></p></div><div id="__training_cursor">➤</div>';
      const style=document.createElement('style');
      style.textContent='#__training_overlay{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Segoe UI,Arial,sans-serif}#__training_top{position:absolute;top:0;left:0;right:0;padding:7px 20px;background:#102d49;color:#fff;font-size:12px;letter-spacing:.07em}#__training_caption{position:absolute;bottom:12px;left:18px;right:18px;background:rgba(16,45,73,.96);border-left:6px solid #ffcf00;border-radius:10px;padding:12px 18px;color:white;box-shadow:0 3px 20px #0003}#__training_caption small{display:block;color:#ffcf00;font-size:12px;text-transform:uppercase;letter-spacing:.08em}#__training_caption strong{display:block;font-size:19px;line-height:1.3;margin-top:3px}#__training_caption p{margin:5px 0 0;font-size:16px;line-height:1.3;color:#fff}#__training_cursor{position:absolute;left:30px;top:100px;font-size:28px;line-height:1;color:#ffcf00;text-shadow:0 0 2px #102d49,1px 1px 2px #102d49;transform:rotate(-20deg);transition:left .2s,top .2s} [data-training-mark]{outline:4px solid #ffca00!important;outline-offset:4px!important} @media(max-width:500px){#__training_caption{padding:10px;left:8px;right:8px}#__training_caption p{font-size:13px}#__training_caption strong{font-size:16px}}';
      root.appendChild(style);
    }
    const parent=document.querySelector('dialog[open]')||document.body;
    if(parent&&root.parentNode!==parent)parent.appendChild(root);
    if(document.body)document.body.style.paddingBottom='140px';
    return root;
  }
  window.__tutorial.show = (data) => {
    const root=ensure();
    root.querySelector('#__training_top').textContent='MIAS ENERGY SOLUTIONS • LOCAL TRAINING • FICTIONAL DATA';
    root.querySelector('small').textContent=data.group+' • '+data.chapter;
    root.querySelector('strong').textContent=data.title;
    root.querySelector('p').textContent=data.instruction;
  };
  window.__tutorial.point = ([x,y]) => {const c=ensure().querySelector('#__training_cursor');c.style.left=x+'px';c.style.top=y+'px';};
})();
"""


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def narration():
    OUT.mkdir(parents=True, exist_ok=True)
    items=[]
    for step in STEPS:
        target=PRIVATE/"audio"/(step["key"]+".wav")
        target.parent.mkdir(exist_ok=True)
        items.append({"path":str(target),"text":step["narration"]})
    manifest=PRIVATE/"narration-jobs.json"
    write_json(manifest,items)
    literal=str(manifest).replace("'","''")
    source="$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SelectVoice('Microsoft Zira Desktop'); $s.Rate=-1; try { $jobs=Get-Content -LiteralPath '"+literal+"' -Raw | ConvertFrom-Json; foreach($j in $jobs){$s.SetOutputToWaveFile($j.path);$s.Speak($j.text);$s.SetOutputToNull()} } finally {$s.Dispose()}"
    result=subprocess.run(["powershell.exe","-NoProfile","-Command",source],creationflags=FLAGS,capture_output=True,text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-2000:])
    for item in items:
        with wave.open(item["path"]) as audio:
            assert audio.getnframes()>0
    print(f"Narration ready: {len(items)} English voice segments.",flush=True)


class Tutorial:
    def __init__(self, playwright, resume):
        self.browser=playwright.chromium.launch(channel="msedge")
        self.state_path=PRIVATE/"recording-state.json"
        self.data=json.loads(self.state_path.read_text()) if resume and self.state_path.exists() else {"states":{},"vars":{},"segments":[]}
        self.states,self.v=self.data["states"],self.data["vars"]
        self.setup_context=self.browser.new_context(reduced_motion="reduce")
        self.admin=self.setup_context.new_page()
        self.context=None
        self.page=None
        self.role="guest"
        self.current=None
        self.zero=0
        self.raw=None

    def save(self):
        write_json(self.state_path,self.data)

    def goto(self,path):
        self.page.goto(path if path.startswith("http") else BASE+path,wait_until="networkidle",timeout=90000)
        self.page.wait_for_timeout(250)
        self.show()

    def show(self):
        if self.current:
            self.page.evaluate(OVERLAY)
            self.page.evaluate("data=>window.__tutorial.show(data)",self.current)

    def mark(self,locator):
        locator=locator.first
        locator.scroll_into_view_if_needed()
        locator.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
        self.page.wait_for_timeout(220)
        self.show()
        self.page.evaluate("document.querySelectorAll('[data-training-mark]').forEach(e=>e.removeAttribute('data-training-mark'))")
        locator.evaluate("e=>e.setAttribute('data-training-mark','')")
        box=locator.bounding_box()
        if box:self.page.evaluate("p=>window.__tutorial.point(p)",[box["x"]+box["width"]/2,box["y"]+box["height"]/2])
        self.page.wait_for_timeout(400)
        return locator

    def click(self,locator):
        self.mark(locator).click()
        self.page.wait_for_timeout(350)

    def fill(self,label,value,scope=None):
        target=(scope or self.page).get_by_label(label,exact=True)
        if not target.count():
            target=(scope or self.page).get_by_label(label,exact=False)
        self.mark(target)
        target.fill("")
        if "password" in label.lower():target.fill(value)
        else:target.press_sequentially(value,delay=18)

    def button(self,name,scope=None):
        self.click((scope or self.page).get_by_role("button",name=name,exact=True))

    def submit(self,name,scope=None):
        with self.page.expect_response(lambda response: response.request.method=="POST"):
            self.button(name,scope)

    def setup(self):
        if self.states:
            self.setup_context.add_cookies(self.states["owner"]["cookies"])
            self.admin.goto(BASE+"/dev/inbox",wait_until="networkidle")
            return
        # Bootstrap only in the isolated training database using the existing helper.
        self.admin.goto(BASE+"/dev/inbox",wait_until="networkidle",timeout=90000)
        self.admin.get_by_label("Owner name").fill(NAMES["owner"])
        self.admin.get_by_label("Owner email").fill(EMAIL["owner"])
        self.admin.get_by_role("button",name="Create Owner invitation",exact=True).click()
        link=self.admin.locator("[data-owner-invite]")
        link.wait_for()
        self.admin.goto(link.get_attribute("href"),wait_until="networkidle")
        self.admin.get_by_label("Choose a password").fill(PASSWORD)
        self.admin.get_by_role("button",name="Create my account",exact=True).click()
        self.admin.wait_for_url("**/staff")
        self.states["owner"]=self.setup_context.storage_state()
        for role in ["staff","colleague"]:
            self.admin.goto(BASE+"/staff/team",wait_until="networkidle")
            form=self.admin.locator("form[data-invite-form]")
            form.get_by_label("Name",exact=True).fill(NAMES[role])
            form.get_by_label("Email address",exact=True).fill(EMAIL[role])
            form.get_by_label("Role",exact=True).select_option("staff")
            form.get_by_role("button",name="Send invitation",exact=True).click()
            form.get_by_role("status").wait_for()
            link=self.email_link(EMAIL[role],"invitation")
            context=self.browser.new_context(reduced_motion="reduce")
            page=context.new_page()
            page.goto(link,wait_until="networkidle")
            page.get_by_label("Choose a password").fill(PASSWORD)
            page.get_by_role("button",name="Create my account",exact=True).click()
            page.wait_for_url("**/staff")
            self.states[role]=context.storage_state()
            context.close()
        self.save()
        print("Fictional Owner and Staff accounts prepared in the isolated database.",flush=True)

    def email_link(self,email,kind):
        self.admin.goto(BASE+"/dev/inbox",wait_until="networkidle")
        row=self.admin.locator(f'[data-email-kind="{kind}"][data-email-to="{email}"]').first
        row.wait_for()
        return row.locator("[data-email-link]").get_attribute("href")

    def activate(self,role,path=None):
        if self.role in self.states:
            self.states[self.role]=self.context.storage_state()
        self.context.clear_cookies()
        if role in self.states:self.context.add_cookies(self.states[role]["cookies"])
        self.role=role
        if path:self.goto(path)

    def login(self,role,password=PASSWORD):
        self.context.clear_cookies()
        self.role=role
        self.goto("/sign-in")
        self.fill("Email address",EMAIL[role])
        self.fill("Password",password)
        self.button("Sign in")
        self.page.wait_for_url("**/account" if role=="customer" else "**/staff")
        self.states[role]=self.context.storage_state()

    def contact(self,email,name,message):
        self.goto("/contact")
        self.page.get_by_role("button",name="Prepare WhatsApp message",exact=True).wait_for()
        self.fill("Your name",name)
        self.fill("Phone number","+260977555101")
        self.fill("Email address",email)
        self.click(self.page.get_by_role("radio",name="Email",exact=True))
        self.mark(self.page.get_by_label("Service",exact=True)).select_option("water")
        self.fill("Project area","Training site")
        self.fill("Project details",message)

    def submit_contact(self):
        self.page.wait_for_timeout(3200)
        self.button("Send inquiry to Mias")
        result=self.page.get_by_role("status").filter(has_text="Thank you")
        result.wait_for()
        return re.search(r"MES-\d{2}-[0-9A-HJKMNP-TV-Z]{5}",result.inner_text()).group()

    def review(self,status,reason):
        from playwright.sync_api import expect
        form=self.page.get_by_label("Review status",exact=True).locator("xpath=ancestor::form")
        before=int(form.locator('[name="expectedVersion"]').input_value())
        self.mark(form.get_by_label("Review status",exact=True)).select_option(status)
        self.fill("Review reason",reason,form)
        self.submit("Save review",form)
        form.get_by_role("status").wait_for()
        expect(form.locator('[name="expectedVersion"]')).to_have_value(str(before+1))

    def accept(self,reference,scope):
        self.goto("/staff?q="+reference)
        self.click(self.page.get_by_role("link",name="Review / accept",exact=True))
        form=self.page.locator("form[data-accept-job]")
        self.fill("Agreed scope",scope,form)
        self.fill("Next step","Arrange the training site assessment",form)
        self.fill("Reason","TRAINING ONLY: assessment agreed for this demonstration",form)
        self.button("Accept and create job",form)
        self.page.wait_for_url("**/staff/jobs/*")
        return urlsplit(self.page.url)._replace(query="",fragment="").geturl()

    def workflow(self,stage,next_step,reason,assignee=None):
        from playwright.sync_api import expect
        self.goto(self.v["job"])
        form=self.page.locator("form[data-workflow-form]")
        before=int(form.locator('[name="expectedVersion"]').input_value())
        if assignee:self.mark(form.get_by_label("Responsible staff",exact=True)).select_option(label=assignee)
        self.mark(form.get_by_label("Stage",exact=True)).select_option(stage)
        self.fill("Next step",next_step,form)
        self.fill("Reason",reason,form)
        self.submit("Update job",form)
        if stage in ["completed","cancelled"]:
            form.wait_for(state="detached")
            self.mark(self.page.locator(".job-overview"))
            return
        form.get_by_role("status").wait_for()
        expect(form.locator('[name="expectedVersion"]')).to_have_value(str(before+1))

    def invite(self,job,email,name):
        from playwright.sync_api import expect
        self.goto(job)
        form=self.page.locator("form[data-customer-invite]")
        before=int(form.locator('[name="expectedVersion"]').input_value())
        self.fill("Customer name",name,form)
        self.fill("Customer email",email,form)
        self.click(form.get_by_role("checkbox"))
        self.submit("Invite customer",form)
        form.get_by_role("status").wait_for()
        expect(form.locator('[name="expectedVersion"]')).to_have_value(str(before+1))
        return self.email_link(email,"job-invitation")

    def message(self,label,body,button):
        form=self.page.get_by_label(label,exact=True).locator("xpath=ancestor::form")
        self.fill(label,body,form)
        self.submit(button,form)
        form.get_by_role("status").wait_for()

    def card(self,title,body):
        self.page.set_content('<html><body style="margin:0;background:#102d49;color:white;font-family:Segoe UI,Arial;display:flex;align-items:center;min-height:100vh"><div style="padding:75px"><div style="color:#ffcf00;letter-spacing:.2em;font-size:20px">MIAS ENERGY SOLUTIONS</div><h1 style="font-size:56px;line-height:1.1;max-width:1000px">'+html.escape(title)+'</h1><p style="font-size:25px;line-height:1.5;max-width:960px">'+html.escape(body)+'</p></div></body></html>')
        self.show()

    def action(self,key):
        p=self.page
        if key=="intro":
            self.card("Customer and Staff how-to guide","Current local preview • Recorded 29 October 2026 • All account and job data in this demonstration is fictional.")
        elif key=="public_services":
            self.activate("guest","/")
            self.click(p.get_by_role("link",name="Services",exact=True).first)
            self.goto("/services/water")
            self.mark(p.get_by_role("link",name="Prepare an inquiry",exact=True))
            self.goto("/services/electrical")
            self.goto("/services/renewable-energy")
            self.goto("/services/solar-water-pumping")
            self.goto("/about")
        elif key=="public_projects":
            self.goto("/projects")
            self.click(p.locator('[data-province-option="Lusaka"]'))
            self.click(p.locator('[data-province-option="Copperbelt"]'))
            filters=p.get_by_role("group",name="Filter projects by service")
            self.click(filters.get_by_role("button",name="Water",exact=True))
            self.click(p.get_by_role("link",name="Explore example",exact=True).first)
        elif key=="public_photos":
            self.goto("/projects#work")
            self.click(p.locator("[data-work-photo]").first)
            self.button("Next photo")
            self.button("Previous photo")
            self.button("Close photo viewer")
            self.goto("/contact")
            self.mark(p.locator('.contact-methods'))
        elif key=="contact_validation":
            self.goto("/contact")
            p.get_by_role("button",name="Prepare WhatsApp message",exact=True).wait_for()
            self.button("Send inquiry to Mias")
            p.locator("main").get_by_role("alert").wait_for()
            self.fill("Your name",NAMES["guest"])
            self.fill("Email address",EMAIL["guest"])
            self.click(p.get_by_role("radio",name="Email",exact=True))
            self.fill("Phone number","+260977555102")
            self.mark(p.get_by_label("Service",exact=True)).select_option("water")
            self.fill("Project area","Fictional training site")
            self.fill("Project details","TRAINING ONLY: please assess the demonstration booster pump.")
        elif key=="contact_whatsapp":
            self.button("Prepare WhatsApp message")
            self.mark(p.get_by_role("region",name="Prepared WhatsApp message"))
        elif key=="contact_send":
            self.v["guest_ref"]=self.submit_contact()
        elif key=="signup":
            self.activate("guest","/sign-up")
            self.fill("Your name",NAMES["customer"])
            self.fill("Email address",EMAIL["customer"])
            self.fill("Phone number","+260977555103")
            self.fill("Password",PASSWORD)
            self.button("Create account")
            p.get_by_role("heading",name="Check your email").wait_for()
        elif key=="confirm_resend":
            self.goto("/sign-in")
            self.fill("Email address",EMAIL["customer"])
            self.fill("Password",PASSWORD)
            self.button("Sign in")
            p.get_by_role("heading",name="Confirm your email first").wait_for()
            self.button("Send the link again")
            p.get_by_text("If that account still needs confirming",exact=False).wait_for()
            self.goto(self.email_link(EMAIL["customer"],"verify-email"))
            p.get_by_role("heading",name="Email confirmed",exact=True).wait_for()
        elif key=="customer_login":
            self.login("customer")
            self.mark(p.get_by_role("heading",name="Your jobs",exact=True))
        elif key=="customer_profile":
            self.goto("/account")
            self.fill("Your name","Training Customer Updated")
            self.fill("Phone number","+260977555103")
            self.button("Save details")
            p.get_by_role("status").wait_for()
        elif key=="signed_request":
            self.goto("/contact")
            p.get_by_role("button",name="Prepare WhatsApp message",exact=True).wait_for()
            self.click(p.get_by_role("radio",name="Email",exact=True))
            self.fill("Project details","TRAINING ONLY: assess a fictional pump control installation.")
            self.v["reference"]=self.submit_contact()
            self.goto("/account")
            self.mark(p.get_by_role("heading",name="Your inquiries",exact=True))
        elif key=="staff_login":
            self.login("staff")
            self.mark(p.get_by_role("navigation",name="Workspace",exact=True))
        elif key=="staff_search":
            self.goto("/staff")
            self.fill("Search inquiries",EMAIL["customer"])
            self.button("Search")
            self.fill("Search inquiries",self.v["reference"])
            self.button("Search")
            self.click(p.get_by_role("link",name=self.v["reference"],exact=True))
            self.click(p.get_by_role("link",name="Review request",exact=True))
        elif key=="staff_review":
            self.review("under-review","TRAINING: reviewing the supplied details")
            self.review("awaiting-information","TRAINING: awaiting site information")
            self.review("closed","TRAINING: demonstrating a closed review")
            assert not p.locator("form[data-accept-job]").count()
            self.review("under-review","TRAINING: reopen after the example information arrives")
        elif key=="staff_accept":
            self.v["job"]=self.accept(self.v["reference"],"TRAINING: assess the pump control installation")
        elif key=="staff_jobs":
            self.goto("/staff/jobs")
            self.fill("Search jobs","TRAINING")
            self.mark(p.get_by_label("Job stage",exact=True)).select_option("assessment")
            self.button("Search")
            self.click(p.get_by_role("link",name=self.v["job"].rsplit("/",1)[1],exact=True))
            self.mark(p.get_by_role("link",name="Original inquiry:",exact=False))
        elif key=="staff_workflow":
            self.workflow("awaiting-quotation","Review the training assessment decision","TRAINING: assessment decision pending")
            self.workflow("scheduled","Training visit scheduled","TRAINING: demonstration visit agreed",NAMES["colleague"])
        elif key=="staff_hold":
            self.workflow("on-hold","Await the training site's availability","TRAINING: work paused")
            self.workflow("scheduled","Proceed with the training visit","TRAINING: resume scheduled work",NAMES["staff"])
        elif key=="staff_invite_existing":
            self.v["existing_invite"]=self.invite(self.v["job"],EMAIL["customer"],"Training Customer Updated")
            self.mark(p.get_by_role("heading",name="Customer access",exact=True))
        elif key=="customer_existing_access":
            self.activate("customer",self.v["existing_invite"])
            self.button("Accept job access")
            p.wait_for_url("**/account/jobs/*")
            self.v["customer_job"]=urlsplit(p.url)._replace(query="",fragment="").geturl()
        elif key=="customer_job":
            self.goto("/account")
            self.click(p.get_by_role("link",name=self.v["job"].rsplit("/",1)[1],exact=True))
            self.message("Message to Mias","TRAINING: please confirm the demonstration visit time.","Send message")
        elif key=="staff_communications":
            self.activate("staff",self.v["job"])
            self.mark(p.get_by_text("TRAINING: please confirm the demonstration visit time.",exact=True))
            self.message("Message to customer","TRAINING: the team will confirm the demonstration visit.","Send message")
            self.message("Customer update","TRAINING: the assessment is scheduled; see the next step.","Publish update")
        elif key=="staff_private":
            self.message("Internal note","TRAINING PRIVATE NOTE: internal planning only.","Save private note")
            self.mark(p.get_by_role("heading",name="History",exact=True))
        elif key=="customer_progress":
            self.activate("customer",self.v["customer_job"])
            assert "TRAINING PRIVATE NOTE" not in p.content()
            self.mark(p.get_by_role("heading",name="Job conversation",exact=True))
            self.message("Message to Mias","TRAINING: thank you; I will be available.","Send message")
        elif key=="staff_guest_job":
            self.activate("staff","/staff")
            self.v["guest_job"]=self.accept(self.v["guest_ref"],"TRAINING: assess the guest's demonstration booster pump")
            self.v["guest_invite"]=self.invite(self.v["guest_job"],EMAIL["guest"],NAMES["guest"])
        elif key=="customer_new_access":
            self.activate("guest",self.v["guest_invite"])
            self.fill("Choose a password",PASSWORD)
            self.button("Create account and open job")
            p.wait_for_url("**/account/jobs/*")
            self.role="invited"
            self.states["invited"]=self.context.storage_state()
            self.mark(p.get_by_role("heading",name="Job conversation",exact=True))
        elif key=="customer_isolation":
            self.goto(self.v["job"].replace("/staff/jobs/","/account/jobs/"))
            assert "404" in p.locator("main").inner_text()
        elif key=="staff_invite_controls":
            self.activate("staff",self.v["job"])
            # An unlinked job with cancelled access can issue a new invitation.
            self.goto(self.v["guest_job"])
            self.fill("Reason for revoking access","TRAINING: demonstrate a fresh reviewed invitation")
            self.button("Revoke customer access")
            p.get_by_role("status").filter(has_text="Customer access revoked").wait_for()
            self.invite(self.v["guest_job"],EMAIL["guest"],NAMES["guest"])
            self.invite(self.v["guest_job"],EMAIL["guest"],NAMES["guest"])
            self.goto(self.v["guest_job"])
            self.button("Cancel customer invitation")
            p.get_by_role("status").filter(has_text="Invitation cancelled").wait_for()
            self.mark(p.get_by_role("heading",name="Customer access",exact=True))
        elif key=="staff_delivery":
            self.goto(self.v["job"])
            self.mark(p.get_by_role("heading",name="Notification delivery",exact=True))
            self.button("Retry pending notifications")
            p.get_by_text("Eligible notifications retried",exact=False).wait_for()
        elif key=="staff_finish":
            self.workflow("in-progress","Carry out the training assessment","TRAINING: demonstration work started")
            self.workflow("completed","Training example finished","TRAINING: demonstration completed")
            assert not p.locator("form[data-workflow-form]").count()
        elif key=="staff_cancel":
            self.goto(self.v["guest_job"])
            form=p.locator("form[data-workflow-form]")
            self.mark(form.get_by_label("Stage",exact=True)).select_option("cancelled")
            self.fill("Next step","No further training work planned",form)
            self.fill("Reason","TRAINING: demonstrate cancellation",form)
            self.button("Update job",form)
            form.wait_for(state="detached")
            self.mark(p.locator(".job-overview"))
        elif key=="staff_revoke":
            self.goto(self.v["job"])
            self.fill("Reason for revoking access","TRAINING: demonstrate removal of portal access")
            self.button("Revoke customer access")
            p.get_by_role("status").filter(has_text="Customer access revoked").wait_for()
        elif key=="customer_revoked":
            self.activate("customer",self.v["customer_job"])
            assert "404" in p.locator("main").inner_text()
            self.goto("/account")
            self.mark(p.get_by_role("heading",name="Your inquiries",exact=True))
        elif key=="account_recovery":
            self.context.clear_cookies()
            self.role="guest"
            self.goto("/forgot-password")
            self.fill("Email address",EMAIL["customer"])
            self.button("Email me a reset link")
            p.get_by_role("status").wait_for()
            self.goto(self.email_link(EMAIL["customer"],"reset-password"))
            self.fill("New password",NEW_PASSWORD)
            self.button("Set new password")
            p.get_by_role("heading",name="Password changed",exact=True).wait_for()
        elif key=="account_signout":
            self.login("customer",NEW_PASSWORD)
            self.click(p.get_by_role("button",name="Sign out",exact=True).first)
            p.wait_for_url(BASE+"/")
            self.states.pop("customer",None)
            self.role="guest"
        elif key=="staff_profile":
            self.activate("staff","/account")
            self.fill("Your name",NAMES["staff"])
            self.fill("Phone number","+260977555104")
            self.button("Save details")
            p.get_by_role("status").wait_for()
            self.goto("/staff")
        elif key=="owner_team":
            self.activate("owner","/staff/team")
            form=p.locator("form[data-invite-form]")
            self.fill("Name","Training New Colleague",form)
            self.fill("Email address",EMAIL["newcolleague"],form)
            self.mark(form.get_by_label("Role",exact=True)).select_option("staff")
            self.button("Send invitation",form)
            form.get_by_role("status").wait_for()
        elif key=="owner_cancel":
            row=p.locator("[data-invitation]",has_text=EMAIL["newcolleague"])
            self.button("Cancel invitation",row)
            row.wait_for(state="detached")
        elif key=="owner_roles":
            for role in ["owner","staff"]:
                self.goto("/staff/team")
                row=p.locator("[data-person]",has_text=EMAIL["colleague"])
                self.mark(row.get_by_role("combobox")).select_option(role)
                self.button("Change role",row)
                p.wait_for_timeout(600)
        elif key=="owner_status":
            self.goto("/staff/team")
            row=p.locator("[data-person]",has_text=EMAIL["colleague"])
            self.button("Deactivate",row)
            row.get_by_role("button",name="Reactivate",exact=True).wait_for()
            self.button("Reactivate",row)
            row.get_by_role("button",name="Deactivate",exact=True).wait_for()
            own=p.locator("[data-person]",has_text=EMAIL["owner"])
            self.button("Deactivate",own)
            p.locator("main").get_by_role("alert").wait_for()
            self.mark(p.get_by_role("heading",name="Recent changes",exact=True))
        elif key=="local_inbox":
            self.activate("owner","/dev/inbox")
            self.mark(p.get_by_role("heading",name="Customer email and SMS notifications",exact=True))
            self.mark(p.get_by_role("heading",name="Account emails",exact=True))
        elif key=="local_failure":
            self.activate("guest","/dev/inbox")
            self.button("Simulate SMS failure")
            self.contact("training-retry@example.com","Training Retry","TRAINING ONLY: independent channel failure example.")
            self.v["retry_ref"]=self.submit_contact()
            self.goto("/dev/inbox")
            failed=p.locator('[data-notification-kind="request-receipt"][data-channel="sms"]',has_text=self.v["retry_ref"])
            self.mark(failed)
            self.button("Normal")
            p.wait_for_timeout(600)
            self.mark(p.locator('[data-notification-kind="request-receipt"][data-channel="sms"]',has_text=self.v["retry_ref"]))
        elif key=="local_db_failure":
            self.goto("/dev/inbox")
            self.button("Simulate database failure")
            self.contact("training-save-failure@example.com","Training Save Failure","TRAINING ONLY: this simulated failure must not save.")
            p.wait_for_timeout(3200)
            self.button("Send inquiry to Mias")
            p.get_by_role("alert").filter(has_text="couldn’t save").wait_for()
            self.goto("/dev/inbox")
            self.button("Normal")
            row=p.locator("[data-inquiry]",has_text=self.v["retry_ref"])
            self.button("Delete this inquiry",row)
            row.wait_for(state="detached")
        elif key=="mobile":
            self.activate("guest","/")
            p.set_viewport_size({"width":600,"height":720})
            self.button("Open navigation")
            p.wait_for_timeout(700)
            self.click(p.locator("#mobile-navigation").get_by_role("link",name="Contact",exact=True))
            self.mark(p.get_by_label("Your name",exact=True))
        elif key=="outro":
            self.card("Continue with the chapter guide","Use the customer, Staff and Owner videos separately, or watch the complete walkthrough. Live delivery, uploads, shared companies, documents and the solar planner remain future work.")
        else:
            raise ValueError(key)

    def record(self):
        raw_dir=PRIVATE/"recordings"
        raw_dir.mkdir(parents=True,exist_ok=True)
        self.context=self.browser.new_context(viewport={"width":1280,"height":720},reduced_motion="reduce",record_video_dir=str(raw_dir),record_video_size={"width":1280,"height":720})
        self.context.add_init_script(OVERLAY)
        self.zero=time.perf_counter()
        self.page=self.context.new_page()
        self.page.set_default_timeout(35000)
        self.page.goto(BASE,wait_until="networkidle",timeout=90000)
        self.raw=str(self.page.video.path())
        completed={s["key"] for s in self.data["segments"]}
        if completed:
            self.role=self.data.get("role","guest")
            if self.role in self.states:self.context.add_cookies(self.states[self.role]["cookies"])
            self.page.goto(self.data.get("url",BASE),wait_until="networkidle",timeout=90000)
        for index,step in enumerate(STEPS):
            if step["key"] in completed:continue
            self.current=step
            self.show()
            self.page.wait_for_timeout(600)
            start=time.perf_counter()-self.zero
            print(f"Recording {index+1}/{len(STEPS)}: {step['title']}",flush=True)
            try:
                self.action(step["key"])
                self.show()
                self.page.wait_for_timeout(1600)
            except Exception:
                self.page.screenshot(path=str(OUT/"recording-error.png"),full_page=True)
                raise
            end=time.perf_counter()-self.zero
            self.data["segments"].append({**step,"raw":self.raw,"start":start,"end":end})
            if self.role in self.states:self.states[self.role]=self.context.storage_state()
            self.data.update(role=self.role,url=self.page.url)
            self.save()
            if step["key"]=="mobile":
                self.page.set_viewport_size({"width":1280,"height":720})
        self.context.close()
        self.context=None
        print("Screen recording complete.",flush=True)

    def close(self):
        if self.context:self.context.close()
        self.setup_context.close()
        self.browser.close()


def stamp(seconds, separator=","):
    ms=round(seconds*1000)
    hours,ms=divmod(ms,3600000)
    minutes,ms=divmod(ms,60000)
    seconds,ms=divmod(ms,1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}{separator}{ms:03}"

def align():
    """Use actual rendered titles to align clips; recorder and video clocks drift."""
    import collections
    import imageio_ffmpeg
    import numpy as np
    from PIL import Image
    from playwright.sync_api import sync_playwright

    checkpoint=PRIVATE/"recording-state.json"
    state=json.loads(checkpoint.read_text())
    templates_dir=PRIVATE/"alignment"
    templates_dir.mkdir(exist_ok=True)
    boxes={}
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(channel="msedge")
        page=browser.new_page(viewport={"width":1280,"height":720},device_scale_factor=1,reduced_motion="reduce")
        page.goto(BASE,wait_until="networkidle")
        page.evaluate(OVERLAY)
        for step in STEPS:
            if step["key"] in ["intro","outro"]:
                page.set_content('<body style="margin:0;background:#102d49;color:white;font-family:Segoe UI,Arial;display:flex;align-items:center;min-height:100vh"></body>')
                page.evaluate(OVERLAY)
            elif step["key"]=="public_services":
                page.goto(BASE,wait_until="networkidle")
                page.evaluate(OVERLAY)
            page.set_viewport_size({"width":600 if step["key"]=="mobile" else 1280,"height":720})
            page.evaluate("data=>window.__tutorial.show(data)",step)
            boxes[step["key"]]=page.locator("#__training_caption strong").bounding_box()
            page.screenshot(path=str(templates_dir/(step["key"]+".png")))
        browser.close()
    groups=collections.defaultdict(list)
    for segment in state["segments"]:groups[segment["raw"]].append(segment)
    report={}
    for raw,segments in groups.items():
        templates=[]
        for item in segments:
            box=boxes[item["key"]]
            x,y,width,height=int(box["x"]),int(box["y"]),int(box["width"]),int(box["height"])+1
            pixels=np.array(Image.open(templates_dir/(item["key"]+".png")).convert("RGB"))[y:y+height,x:x+width]
            mask=np.all(pixels>190,axis=2)
            templates.append((item,x,y,width,height,mask,np.count_nonzero(mask)))
        process=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),"-hide_banner","-loglevel","error","-i",raw,"-vf","fps=4","-pix_fmt","rgb24","-f","rawvideo","pipe:1"],stdout=subprocess.PIPE,creationflags=FLAGS)
        matches=collections.defaultdict(list)
        frame_number=0
        while True:
            frame=process.stdout.read(1280*720*3)
            if not frame:break
            assert len(frame)==1280*720*3
            array=np.frombuffer(frame,dtype=np.uint8).reshape((720,1280,3))
            best=None
            for item,x,y,width,height,template,count in templates:
                candidate=np.all(array[y:y+height,x:x+width]>190,axis=2)
                intersection=np.count_nonzero(candidate & template)
                score=intersection/max(1,count+np.count_nonzero(candidate)-intersection)
                if best is None or score>best[0]:best=(score,item["key"])
            if best[0]>.62:matches[best[1]].append((frame_number/4,best[0]))
            frame_number+=1
        assert process.wait()==0
        for item in segments:
            found=matches[item["key"]]
            assert found,("No recorded title match",item["key"])
            item.setdefault("clock_timing",dict(start=item["start"],end=item["end"]))
            item.update(start=found[0][0],end=found[-1][0]+.25,aligned_to_video=True)
            report[item["key"]]={"start":item["start"],"end":item["end"],"matches":len(found),"confidence":max(x[1] for x in found)}
            print("Aligned:",item["key"],flush=True)
    write_json(PRIVATE/"alignment-report.json",report)
    write_json(checkpoint,state)


def mp4_duration(path):
    import struct
    def children(stream,start,end):
        stream.seek(start)
        while stream.tell()+8<=end:
            pos=stream.tell()
            size,kind=struct.unpack(">I4s",stream.read(8))
            header=8
            if size==1:
                size=struct.unpack(">Q",stream.read(8))[0]
                header=16
            if not size:size=end-pos
            if size<header:break
            yield kind,pos+header,pos+size
            stream.seek(pos+size)
    with open(path,"rb") as stream:
        for kind,start,end in children(stream,0,path.stat().st_size):
            if kind!=b"moov":continue
            for child,a,b in children(stream,start,end):
                if child!=b"mvhd":continue
                stream.seek(a)
                version=stream.read(4)[0]
                stream.read(16 if version else 8)
                timescale=struct.unpack(">I",stream.read(4))[0]
                duration=struct.unpack(">Q" if version else ">I",stream.read(8 if version else 4))[0]
                return duration/timescale
    raise ValueError("No MP4 movie header found: "+str(path))


def render():
    import imageio_ffmpeg
    import shutil
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    data=json.loads((PRIVATE/"recording-state.json").read_text())
    segments=data["segments"]
    assert len(segments)==len(STEPS),(len(segments),len(STEPS))
    assert all(item.get("aligned_to_video") for item in segments),"Run the align phase before rendering."
    clips=PRIVATE/"final-clips"
    clips.mkdir(exist_ok=True)
    captions_dir=PRIVATE/"caption-text"
    captions_dir.mkdir(exist_ok=True)
    fonts=PRIVATE/"fonts"
    fonts.mkdir(exist_ok=True)
    for filename in ["segoeui.ttf","segoeuib.ttf"]:
        if not (fonts/filename).exists():
            shutil.copyfile(Path(os.environ.get("WINDIR","C:/Windows"))/"Fonts"/filename,fonts/filename)
    regular=(fonts/"segoeui.ttf").relative_to(ROOT).as_posix()
    bold=(fonts/"segoeuib.ttf").relative_to(ROOT).as_posix()
    timeline=[]
    for index,segment in enumerate(segments):
        audio=PRIVATE/"audio"/(segment["key"]+".wav")
        with wave.open(str(audio)) as source:
            voice_length=source.getnframes()/source.getframerate()
        raw_length=segment["end"]-segment["start"]
        # Slow short demonstrations so viewers can follow the highlighted controls
        # while the narration explains them, then hold the final result.
        stretch=min(2.5,max(1,(voice_length+0.4)/raw_length))
        duration=max(raw_length*stretch+1,voice_length+1.2)
        target=clips/f"{index+1:02}-{segment['key']}.mp4"
        if not target.exists():
            mobile_filter="crop=600:720:0:0,pad=1280:720:340:0:color=0x102d49," if segment["key"]=="mobile" else ""
            # Repaint the training lower third consistently over development-only
            # toolbar controls. It repeats the same recorded task instructions.
            overlay="drawbox=x=0:y=610:w=iw:h=110:color=0x102d49:t=fill,drawbox=x=18:y=622:w=5:h=82:color=0xffcf00:t=fill"
            for field,value,font,size,color,y in [
                ("label",(segment["group"]+" • "+segment["chapter"]).upper(),regular,12,"0xffcf00",624),
                ("title",segment["title"],bold,19,"white",651),
                ("instruction",segment["instruction"],regular,16,"white",682)]:
                textfile=captions_dir/(segment["key"]+"-"+field+".txt")
                textfile.write_text(value,encoding="utf-8")
                overlay+=",drawtext=fontfile="+font+":textfile="+textfile.relative_to(ROOT).as_posix()+":fontsize="+str(size)+":fontcolor="+color+":x=42:y="+str(y)
            command=[ffmpeg,"-y","-hide_banner","-loglevel","error","-ss",str(segment["start"]),"-i",segment["raw"],"-i",str(audio),
                     "-vf",mobile_filter+"trim=duration="+str(raw_length)+",setpts=(PTS-STARTPTS)*"+str(stretch)+",fps=15,tpad=stop_mode=clone:stop_duration="+str(duration)+","+overlay+",format=yuv420p",
                     "-af","apad","-t",str(duration),"-c:v","libx264","-preset","veryfast","-crf","24","-c:a","aac","-b:a","80k","-ar","44100","-ac","1","-movflags","+faststart",str(target)]
            result=subprocess.run(command,creationflags=FLAGS,capture_output=True,text=True)
            if result.returncode:raise RuntimeError(result.stderr[-2500:])
        duration=mp4_duration(target)
        timeline.append({**segment,"clip":str(target),"duration":duration,"voice_length":voice_length})
        print(f"Exported {index+1}/{len(segments)}: {segment['title']}",flush=True)
    outputs={"complete-walkthrough":timeline,
             "customer-guide":[s for s in timeline if s["group"] in ["intro","customer","shared","outro"]],
             "staff-guide":[s for s in timeline if s["group"] in ["intro","staff","shared","outro"]],
             "owner-and-local-testing":[s for s in timeline if s["group"] in ["intro","owner","local","outro"]]}
    manifest={}
    for name,items in outputs.items():
        concat=PRIVATE/(name+".concat.txt")
        concat.write_text("".join("file '"+item["clip"].replace("\\","/").replace("'","'\\''")+"'\n" for item in items),encoding="utf-8")
        target=OUT/(name+".mp4")
        result=subprocess.run([ffmpeg,"-y","-hide_banner","-loglevel","error","-f","concat","-safe","0","-i",str(concat),"-c","copy","-movflags","+faststart",str(target)],creationflags=FLAGS,capture_output=True,text=True)
        if result.returncode:raise RuntimeError(result.stderr[-2000:])
        offset=0
        chapters=[]
        captions=[]
        for item in items:
            if not chapters or chapters[-1]["chapter"]!=item["chapter"]:
                chapters.append({"chapter":item["chapter"],"start":offset,"group":item["group"]})
            words=item["narration"].split()
            groups=[words[i:i+14] for i in range(0,len(words),14)]
            interval=item["voice_length"]/max(1,len(groups))
            for n,group in enumerate(groups):
                captions.append((offset+n*interval,offset+(n+1)*interval," ".join(group)))
            offset+=item["duration"]
        srt="\n\n".join(f"{i+1}\n{stamp(start)} --> {stamp(end)}\n{text}" for i,(start,end,text) in enumerate(captions))+"\n"
        (OUT/(name+".srt")).write_text(srt,encoding="utf-8")
        (OUT/(name+".vtt")).write_text("WEBVTT\n\n"+"\n\n".join(f"{stamp(start,'.')} --> {stamp(end,'.')} line:65%\n{text}" for start,end,text in captions)+"\n",encoding="utf-8")
        chapter_metadata=PRIVATE/(name+".ffmetadata")
        chapter_metadata.write_text(";FFMETADATA1\n"+"".join(
            "[CHAPTER]\nTIMEBASE=1/1000\nSTART="+str(round(chapter["start"]*1000))+"\nEND="+str(round((chapters[i+1]["start"] if i+1<len(chapters) else offset)*1000))+"\ntitle="+chapter["chapter"]+"\n"
            for i,chapter in enumerate(chapters)),encoding="utf-8")
        with_subtitles=OUT/(name+".subtitled.mp4")
        mux=subprocess.run([ffmpeg,"-y","-hide_banner","-loglevel","error","-i",str(target),"-i",str(OUT/(name+".srt")),"-i",str(chapter_metadata),"-map","0:v:0","-map","0:a:0","-map","1:0","-map_chapters","2","-c","copy","-c:s","mov_text","-metadata:s:s:0","language=eng","-disposition:s:0","0","-movflags","+faststart",str(with_subtitles)],creationflags=FLAGS,capture_output=True,text=True)
        if mux.returncode:raise RuntimeError(mux.stderr[-2000:])
        with_subtitles.replace(target)
        manifest[name]={"file":target.name,"seconds":offset,"chapters":chapters,"bytes":target.stat().st_size}
    write_json(OUT/"chapters.json",manifest)
    transcript=["# Mias Energy Solutions — current-system training","", "Recorded 2026-10-29. Computer-generated English narration; fictional training data in a separate local database. No real messages were sent.",""]
    for item in timeline:
        transcript.extend(["## "+item["chapter"]+" — "+item["title"],"",item["instruction"],"",item["narration"],""])
    (OUT/"transcript.md").write_text("\n".join(transcript),encoding="utf-8")
    checklist=["# Feature coverage","", "Every item below is demonstrated or explicitly explained in the video. Owner and local-testing features are separated from ordinary Staff/customer use.",""]
    for item in timeline:checklist.append("- [x] "+item["group"].title()+": "+item["title"])
    (OUT/"feature-checklist.md").write_text("\n".join(checklist)+"\n",encoding="utf-8")
    player='''<!doctype html><html><head><meta charset="utf-8"><title>Mias system video guides</title><style>body{margin:0;background:#f4f7fa;color:#102d49;font:16px/1.6 Segoe UI,Arial}main{max-width:1180px;margin:auto;padding:28px}h1{line-height:1.2}video{width:100%;background:#102d49;border-radius:16px}button,a{font:inherit}button{padding:10px 15px;border:1px solid #a6b7c8;border-radius:25px;background:white;color:#102d49;cursor:pointer;margin:4px}button:hover{background:#ffcf00}.tabs{margin:20px 0}.chapters{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:5px}.chapters button{text-align:left;border-radius:8px}.note{background:#fff4bc;padding:14px 20px;border-radius:10px}a{color:#075ab8}</style></head><body><main><h1>Mias Energy Solutions: how-to video guides</h1><p>Current local preview • 29 October 2026 • English computer narration and captions</p><p class="note">All training accounts and job details are fictional. Email/SMS are local captures. Uploads, shared companies, quotations/invoices and the solar planner are not yet built.</p><div class="tabs" id="tabs"></div><video controls preload="metadata" id="video"></video><p id="duration"></p><h2>Jump to a chapter</h2><div class="chapters" id="chapters"></div><p><a href="transcript.md">Transcript</a> · <a href="feature-checklist.md">Feature checklist</a> · MP4 videos and matching SRT/VTT captions are in this folder.</p></main><script>const manifest=MANIFEST;const labels={"complete-walkthrough":"Full walkthrough","customer-guide":"Customer guide","staff-guide":"Staff guide","owner-and-local-testing":"Owner + local testing"};const video=document.getElementById("video");function clock(s){return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}function load(name){const item=manifest[name];video.innerHTML="";video.src=item.file;const track=document.createElement("track");track.kind="captions";track.label="English";track.srclang="en";track.src=name+".vtt";video.append(track);document.getElementById("duration").textContent=labels[name]+" · "+clock(item.seconds);const chapters=document.getElementById("chapters");chapters.innerHTML="";for(const c of item.chapters){const b=document.createElement("button");b.textContent=clock(c.start)+" — "+c.chapter;b.onclick=()=>{video.currentTime=c.start;video.play()};chapters.append(b)}}for(const name of Object.keys(manifest)){const b=document.createElement("button");b.textContent=labels[name];b.onclick=()=>load(name);document.getElementById("tabs").append(b)}load("complete-walkthrough");</script></body></html>'''
    (OUT/"index.html").write_text(player.replace("MANIFEST",json.dumps(manifest)),encoding="utf-8")
    readme=["# Mias Energy Solutions — video guides","","Recorded 29 October 2026 from the current local system. Computer-generated English narration, selectable English captions and chapters are included.","",
            "## Watch","","Open `index.html` for the chapter player, or open an MP4 directly in your video player. If your browser blocks local captions, serve this folder with `python -m http.server 3320 --bind 127.0.0.1` and open http://127.0.0.1:3320/.","",
            "| Video | Length | Purpose |","| --- | --- | --- |"]
    descriptions={"complete-walkthrough":"All roles and local testing, in workflow order.","customer-guide":"Browsing, inquiries, accounts, invitations, job progress, messages and password recovery.","staff-guide":"Inquiry review and acceptance, jobs, stages, messages, private notes, invitations and access controls.","owner-and-local-testing":"Owner team administration and development-only notification/failure tools."}
    for name,item in manifest.items():
        minutes,seconds=divmod(round(item["seconds"]),60)
        readme.append(f"| [{name}.mp4]({name}.mp4) | {minutes}:{seconds:02} | {descriptions[name]} |")
    readme.extend(["","The matching `.srt` and `.vtt` files contain captions. `transcript.md` contains the narration; `feature-checklist.md` lists coverage. Chapter timestamps are in `chapters.json` and embedded in each MP4.","",
                   "## Training boundaries","","All accounts, requests and job details in the recording are fictional training examples in a separate database. No real email, SMS or WhatsApp messages were sent. The ordinary preview database was not used.","",
                   "Email/SMS success currently means captured locally. Real delivery and public deployment are not enabled. Uploads, shared company access, quotation/invoice generation and the solar planner remain future work.","",
                   "Invitation/reset links visible in the footage belong only to the fictional training copy. Follow the actions with your own authorized account; do not reuse the example credentials or links.",""])
    (OUT/"README.md").write_text("\n".join(readme),encoding="utf-8")
    print(json.dumps(manifest,indent=2),flush=True)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("phase",choices=["narration","record","align","render","all"])
    parser.add_argument("--resume",action="store_true")
    args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    PRIVATE.mkdir(parents=True,exist_ok=True)
    if args.phase in ["narration","all"]:narration()
    if args.phase in ["record","all"]:
        from playwright.sync_api import sync_playwright
        sys.path.insert(0,str(ROOT/"tests"))
        from conftest import warm_up
        warm_up(BASE)
        with sync_playwright() as playwright:
            tutorial=Tutorial(playwright,args.resume)
            try:
                tutorial.setup()
                tutorial.record()
            finally:tutorial.close()
    if args.phase in ["align","all"]:align()
    if args.phase in ["render","all"]:render()


if __name__=="__main__":
    main()
