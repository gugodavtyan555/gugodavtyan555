"""Builds the Wedding Planner spreadsheet (Excel / Google Sheets).

Sheets: Start Here, Dashboard, Setup, Budget, Guests, Vendors, Checklist. All numbers are live
formulas; checklist due dates are calculated from the wedding date.
Usage: python3 wedding_xlsx.py <output_dir>
"""
import sys
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, DoughnutChart, Reference
from openpyxl.formatting.rule import CellIsRule, DataBarRule, FormulaRule
from openpyxl.styles import Font
from openpyxl.worksheet.datavalidation import DataValidation

import xlsx_products as X

X.ACCENT = "9C5B6B"        # dusty rose
X.ACCENT_LIGHT = "F6E8EA"
MONEY, PCT = X.MONEY, X.PCT

BUDGET = [
    ("Venue", 0.28, 9800, 9800, 4000, "2027-03-01"), ("Catering & drinks", 0.27, 9500, 0, 2000, "2027-08-01"),
    ("Photography & video", 0.11, 3800, 3800, 1000, "2027-08-15"), ("Attire & beauty", 0.07, 2400, 1850, 1850, ""),
    ("Flowers & decor", 0.07, 2400, 0, 500, "2027-08-15"), ("Music & entertainment", 0.05, 1800, 1800, 600, "2027-08-20"),
    ("Rings", 0.05, 1700, 1650, 1650, ""), ("Cake & desserts", 0.02, 700, 0, 150, "2027-08-20"),
    ("Invitations & stationery", 0.02, 600, 540, 540, ""), ("Transport", 0.02, 600, 0, 0, ""),
    ("Favours & gifts", 0.015, 500, 0, 0, ""), ("Officiant & licence", 0.01, 400, 0, 0, ""),
    ("Honeymoon", 0.0, 0, 0, 0, ""), ("Emergency fund", 0.015, 1300, 0, 0, ""),
]

CHECKLIST = [
    (365, "Set the budget and decide who is contributing"), (360, "Draft the guest list"), (350, "Choose a date and book the venue"),
    (330, "Book the photographer and videographer"), (300, "Book the caterer"), (300, "Choose the wedding party"),
    (270, "Send save-the-dates"), (270, "Shop for the wedding dress or suit"), (240, "Book music / DJ / band"),
    (240, "Book florist"), (210, "Plan the honeymoon"), (180, "Order invitations"), (180, "Book hair and make-up"),
    (150, "Order the cake"), (150, "Book transport"), (120, "Buy wedding rings"), (120, "Plan the ceremony with the officiant"),
    (90, "Send invitations"), (90, "First dress fitting"), (75, "Choose readings and vows"), (60, "Buy gifts for the wedding party"),
    (45, "Apply for the marriage licence"), (30, "Final dress fitting"), (30, "Chase missing RSVPs"),
    (21, "Give final numbers to the caterer"), (21, "Create the seating plan"), (14, "Confirm times with every vendor"),
    (14, "Break in your wedding shoes"), (7, "Pack for the honeymoon"), (7, "Prepare final payments and tips in envelopes"),
    (2, "Rehearsal and rehearsal dinner"), (1, "Relax, hydrate and get a good night's sleep"), (0, "Get married and enjoy every minute!"),
]

GUESTS = [("Anna Smith", "Bride", "Family", "Yes", "Chicken", 1, "Yes"), ("Mark Smith", "Bride", "Family", "Yes", "Beef", 1, "Yes"),
          ("Lucy Brown", "Groom", "Friends", "Yes", "Vegetarian", 3, "No"), ("Tom Green", "Groom", "Work", "No", "", "", ""),
          ("Sara Lee", "Bride", "Friends", "Pending", "", "", ""), ("David Kim", "Groom", "Family", "Yes", "Fish", 2, "No"),
          ("Maria Lopez", "Bride", "Friends", "Yes", "Chicken", 3, "No"), ("John Park", "Groom", "Friends", "Pending", "", "", "")]


def build(out):
    wb = Workbook()
    st = wb.active
    st.title = "Setup"
    X.title(st, "Wedding Setup", "Your names, date and total budget. Everything else is calculated from here.")
    st.column_dimensions["B"].width = 26
    st.column_dimensions["C"].width = 22
    X.label_value(st, 5, "Couple", "Emma & James", input_cell=True)
    X.label_value(st, 6, "Wedding date", date(2027, 9, 18), "yyyy-mm-dd", True)
    X.label_value(st, 7, "Total budget", 36000, MONEY, True)
    X.label_value(st, 8, "Venue", "The Orchard House", input_cell=True)
    X.header(st, 10, 2, ["Meal choices"])
    for i, m in enumerate(["Chicken", "Beef", "Fish", "Vegetarian", "Vegan", "Kids meal"] + [None] * 2):
        st.cell(row=11 + i, column=2, value=m)
    X.style_range(st, "B11:B18", input_cell=True)

    # ---------------- Budget
    bd = wb.create_sheet("Budget")
    X.title(bd, "Wedding Budget", "Estimated vs. actual cost, what's paid and what's still due.")
    X.header(bd, 5, 2, ["Category", "Suggested", "Estimated", "Actual", "Paid", "Still to pay", "Due date", "Notes"],
             [26, 13, 13, 13, 13, 13, 13, 26])
    n = 20
    for i in range(n):
        r = 6 + i
        if i < len(BUDGET):
            name, share, est, act, paid, due = BUDGET[i]
            bd.cell(row=r, column=2, value=name)
            bd.cell(row=r, column=3, value=f"=Setup!$C$7*{share}")
            bd.cell(row=r, column=4, value=est)
            bd.cell(row=r, column=5, value=act or None)
            bd.cell(row=r, column=6, value=paid or None)
            if due:
                bd.cell(row=r, column=8, value=date.fromisoformat(due))
        bd.cell(row=r, column=7, value=f'=IF(B{r}="","",MAX(0,IF(N(E{r})>0,E{r},N(D{r}))-N(F{r})))')
    X.style_range(bd, f"B6:B{5+n}", input_cell=True)
    X.style_range(bd, f"D6:F{5+n}", input_cell=True, number_format=MONEY)
    X.style_range(bd, f"H6:I{5+n}", input_cell=True)
    X.style_range(bd, f"C6:C{5+n}", number_format=MONEY)
    X.style_range(bd, f"G6:G{5+n}", number_format=MONEY)
    X.style_range(bd, f"H6:H{5+n}", number_format="yyyy-mm-dd")
    bd.conditional_formatting.add(f"E6:E{5+n}", FormulaRule(formula=[f'AND(N(E6)>0,N(E6)>N(D6))'], fill=X.fill(X.RED_LIGHT), font=Font(color=X.RED, bold=True)))
    t = 6 + n
    bd.cell(row=t, column=2, value="Total")
    for c in "CDEFG":
        bd[f"{c}{t}"] = f"=SUM({c}6:{c}{t-1})"
    X.style_range(bd, f"B{t}:G{t}", bold=True, number_format=MONEY)
    bd.freeze_panes = "B6"

    # ---------------- Guests
    G = 305
    gs = wb.create_sheet("Guests")
    X.title(gs, "Guest List", "RSVPs, meals and seating. Use the dropdowns.")
    X.header(gs, 5, 2, ["Guest name", "Side", "Group", "RSVP", "Meal", "Table", "Gift received", "Thank-you sent", "Address / notes"],
             [24, 10, 12, 11, 13, 8, 18, 14, 30])
    for i, row in enumerate(GUESTS):
        for j, v in enumerate(row[:6]):
            gs.cell(row=6 + i, column=2 + j, value=v if v != "" else None)
        gs.cell(row=6 + i, column=9, value=row[6] or None)
    X.style_range(gs, f"B6:J{G}", input_cell=True)
    X.list_validation(gs, '"Bride,Groom,Both"', f"C6:C{G}")
    X.list_validation(gs, '"Family,Friends,Work,Other"', f"D6:D{G}")
    X.list_validation(gs, '"Yes,No,Pending"', f"E6:E{G}")
    X.list_validation(gs, "=Setup!$B$11:$B$18", f"F6:F{G}")
    X.list_validation(gs, '"Yes,No"', f"I6:I{G}")
    gs.conditional_formatting.add(f"E6:E{G}", CellIsRule(operator="equal", formula=['"Yes"'], fill=X.fill(X.ACCENT_LIGHT), font=Font(color=X.ACCENT, bold=True)))
    gs.conditional_formatting.add(f"E6:E{G}", CellIsRule(operator="equal", formula=['"No"'], font=Font(color="999999")))
    gs.freeze_panes = "B6"

    # ---------------- Vendors
    vn = wb.create_sheet("Vendors")
    X.title(vn, "Vendors", "Contacts, contracts and payment dates in one place.")
    X.header(vn, 5, 2, ["Service", "Company", "Contact", "Phone / email", "Contract signed", "Deposit paid", "Balance due", "Due date"],
             [20, 22, 18, 24, 13, 13, 13, 13])
    for i, (svc, co) in enumerate([("Venue", "The Orchard House"), ("Photographer", "Bloom Photo Co."), ("Caterer", "Fig & Thyme"),
                                   ("Florist", ""), ("DJ / band", "Night Owl Sounds"), ("Cake", "")]):
        vn.cell(row=6 + i, column=2, value=svc)
        vn.cell(row=6 + i, column=3, value=co or None)
    X.style_range(vn, "B6:I30", input_cell=True)
    X.style_range(vn, "G6:H30", number_format=MONEY)
    X.style_range(vn, "I6:I30", number_format="yyyy-mm-dd")
    X.list_validation(vn, '"Yes,No"', "F6:F30")

    # ---------------- Checklist
    ck = wb.create_sheet("Checklist")
    X.title(ck, "Wedding Checklist", "Due dates count back from your wedding date. Tick Done as you go.")
    X.header(ck, 5, 2, ["Task", "Do by", "Done?", "Days left"], [46, 14, 10, 11])
    L = 5 + len(CHECKLIST) + 15
    for i, (days, task) in enumerate(CHECKLIST):
        r = 6 + i
        ck.cell(row=r, column=2, value=task)
        ck.cell(row=r, column=3, value=f"=Setup!$C$6-{days}")
        if days >= 240:
            ck.cell(row=r, column=4, value="Yes")
    for r in range(6, L + 1):
        ck.cell(row=r, column=5, value=f'=IF(OR(B{r}="",C{r}=""),"",IF(D{r}="Yes","✓",C{r}-TODAY()))')
        # hidden sort key for open tasks: date + a tiny row offset so equal dates stay distinct
        ck.cell(row=r, column=7, value=f'=IF(OR(B{r}="",C{r}="",D{r}="Yes"),"",C{r}+ROW()/100000)')
    ck.column_dimensions["G"].hidden = True
    X.style_range(ck, f"B6:D{L}", input_cell=True)
    X.style_range(ck, f"C6:C{L}", number_format="yyyy-mm-dd")
    X.style_range(ck, f"E6:E{L}")
    X.list_validation(ck, '"Yes,No"', f"D6:D{L}")
    ck.conditional_formatting.add(f"B6:E{L}", FormulaRule(formula=['$D6="Yes"'], fill=X.fill(X.ACCENT_LIGHT), font=Font(color="999999")))
    ck.conditional_formatting.add(f"E6:E{L}", FormulaRule(formula=['AND(ISNUMBER($E6),$E6<0)'], fill=X.fill(X.RED_LIGHT), font=Font(color=X.RED, bold=True)))
    ck.freeze_panes = "B6"

    # ---------------- Dashboard
    db = wb.create_sheet("Dashboard", 0)
    X.title(db, "Wedding Dashboard", "Updated from every sheet.")
    db["B3"] = '=Setup!C5&"  ·  "&TEXT(Setup!C6,"d mmmm yyyy")&"  ·  "&Setup!C8'
    for c, w in zip("BCDEFG", [18, 18, 18, 18, 18, 18]):
        db.column_dimensions[c].width = w
    X.kpi(db, 5, 2, "DAYS TO GO", "=MAX(0,Setup!C6-TODAY())", "0")
    X.kpi(db, 5, 3, "BUDGET", "=Setup!C7")
    X.kpi(db, 5, 4, "ESTIMATED", f"=Budget!D{t}")
    X.kpi(db, 5, 5, "PAID SO FAR", f"=Budget!F{t}")
    X.kpi(db, 5, 6, "STILL TO PAY", f"=Budget!G{t}")
    db.conditional_formatting.add("D6", FormulaRule(formula=["D6>C6"], font=Font(color=X.RED, bold=True, size=16)))
    gr = f"Guests!$E$6:$E${G}"
    X.kpi(db, 9, 2, "INVITED", f"=COUNTA(Guests!$B$6:$B${G})", "0")
    X.kpi(db, 9, 3, "ATTENDING", f'=COUNTIF({gr},"Yes")', "0")
    X.kpi(db, 9, 4, "DECLINED", f'=COUNTIF({gr},"No")', "0")
    X.kpi(db, 9, 5, "PENDING", f'=COUNTIF({gr},"Pending")+COUNTIFS(Guests!$B$6:$B${G},"<>",{gr},"")', "0")
    X.kpi(db, 9, 6, "TASKS DONE", f'=IF(COUNTA(Checklist!$B$6:$B${L})=0,0,COUNTIF(Checklist!$D$6:$D${L},"Yes")/COUNTA(Checklist!$B$6:$B${L}))', PCT)
    db["B13"] = f'=IF(Budget!D{t}>Setup!C7,"⚠ Your estimate is "&TEXT(Budget!D{t}-Setup!C7,"#,##0")&" over budget.","✓ Your estimate fits the budget.")'
    db["B13"].font = Font(bold=True, color=X.ACCENT)
    X.header(db, 15, 2, ["Meal", "Count"])
    for i in range(8):
        r = 16 + i
        db.cell(row=r, column=2, value=f'=IF(Setup!B{11+i}="","",Setup!B{11+i})')
        db.cell(row=r, column=3, value=f'=IF(B{r}="","",COUNTIFS(Guests!$F$6:$F${G},B{r},{gr},"Yes"))')
    X.style_range(db, "B16:C23")
    X.header(db, 15, 5, ["Next tasks", "Do by"])
    for i in range(6):
        r = 16 + i
        # i-th earliest open task: smallest date among rows not done
        key = f"SMALL(Checklist!$G$6:$G${L},{i+1})"
        db.cell(row=r, column=6, value=f'=IFERROR(INT({key}),"")')
        db.cell(row=r, column=5, value=f'=IFERROR(INDEX(Checklist!$B$6:$B${L},MATCH({key},Checklist!$G$6:$G${L},0)),"")')
    X.style_range(db, "E16:F21")
    X.style_range(db, "F16:F21", number_format="yyyy-mm-dd")
    db.column_dimensions["E"].width = 40
    bc = BarChart()
    bc.type = "bar"
    bc.title = "Estimated vs. actual"
    bc.height, bc.width = 9, 16
    bc.add_data(Reference(bd, min_col=4, max_col=5, min_row=5, max_row=17), titles_from_data=True)
    bc.set_categories(Reference(bd, min_col=2, min_row=6, max_row=17))
    db.add_chart(bc, "H5")

    X.howto(wb, "Wedding Planner", [
        "Open 'Setup': enter your names, wedding date, total budget and meal choices.",
        "Open 'Budget': the Suggested column splits your total budget by typical percentages. Fill in estimates, actual costs and what you've paid.",
        "Open 'Guests': add every guest and update RSVPs, meals and tables as answers arrive.",
        "Open 'Checklist': due dates are worked out from your wedding date. Mark tasks Done as you go; overdue tasks turn red.",
        "Open 'Dashboard': days to go, budget, RSVPs, meal counts and your next tasks at a glance.",
    ])
    wb.active = 0
    path = out / "Wedding-Planner.xlsx"
    wb.save(path)
    return path


if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    print("wrote", build(out))
