# Trying the solar load planner

**Historical walkthrough:** the planner was removed at Henry's request on 6 November 2026. These controls are no longer available. Solar requests now use the normal Contact form; the planner remains a [deferred suggestion](../ideas/solar-planner.md).

1. When the local preview is running, open **Solar planner** in the public navigation, or select **Open solar load planner** on the renewable-energy service page.
2. Enter each appliance's name, quantity, watts per item and expected operating hours per day. Choose its category. Use **Watts not known** or **Hours not known** instead of guessing a rating or treating an unknown as zero.
3. Mark essential appliances and the group you expect to run together. These are your choices; the planner does not infer simultaneous demand, starting surge, cycling or standby behavior. Add/remove controls preserve other entries, including contact details, and work without JavaScript.
4. Enter the area and optional desired backup hours, then **Calculate load summary**. Compare W/kW (power) with Wh/kWh (energy). Incomplete results show the known portion and assessment reasons. Backup hours are an assessment preference, not a battery selection.
5. To share the plan, complete the contact/reply fields and select **Send solar inquiry**. Calculation alone does not save a database record. Sending validates and recalculates on the server, then saves the inquiry and its versioned planning snapshot together. Keep the request reference. Failures retain the inputs and remain visible.
6. As Staff or Owner, open the inquiry from **Inquiries → Review / accept**. The original solar summary appears beside the inquiry details. Accept work into a job and invite the verified customer using the existing workflow. The job retains its original saved planning inputs.
7. As that linked customer, open the job from **My account → Your jobs**. The original summary appears with the job. Company names or matching emails do not grant access; Staff must invite each contact. Revoking access prevents later reads.
8. Use increment 010's document workflow when actual agreed pricing is ready. This planner does not fill in equipment, quantities, prices or tax treatment for a quotation.

The current slice is a load summary and inquiry handoff. Equipment sizing and prices remain a later 011 slice requiring Mias-approved technical rules, a supported catalogue, a dated price list and independently worked design examples. The arithmetic fixtures in the software tests are synthetic; they are not appliance defaults or approved system designs.

The normal preview remains stopped at Henry's request. Start website.cmd starts it when Henry is ready to review. There is no public deployment or real external email/SMS delivery.
