"""Builds the spreadsheet products sold in the shop.

Every number the buyer sees is a live formula, so the files work in
Excel, Google Sheets (File > Import) and LibreOffice.

Usage: python3 xlsx_products.py <output_dir>
"""
import sys
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, DoughnutChart, Reference
from openpyxl.formatting.rule import CellIsRule, DataBarRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter as col
from openpyxl.worksheet.datavalidation import DataValidation

BRAND = "Penny & Plan"
INK = "1F2A37"
ACCENT = "2F7D5B"
ACCENT_LIGHT = "E3F1EA"
INPUT = "FFF8E1"
MUTED = "6B7280"
LINE = "D9DEE3"
RED = "C0392B"
RED_LIGHT = "FBE4E1"

thin = Side(style="thin", color=LINE)
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
MONEY = '#,##0.00;[Red]-#,##0.00'
PCT = '0%'
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def fill(hex_):
    return PatternFill("solid", start_color=hex_, end_color=hex_)


def title(ws, text, subtitle, width_cols=8):
    ws.sheet_view.showGridLines = False
    ws["B2"] = text
    ws["B2"].font = Font(name="Calibri", size=20, bold=True, color=INK)
    ws["B3"] = subtitle
    ws["B3"].font = Font(name="Calibri", size=10, color=MUTED)
    ws.column_dimensions["A"].width = 3
    ws.row_dimensions[2].height = 30


def header(ws, row, start_col, labels, widths=None):
    for i, label in enumerate(labels):
        c = ws.cell(row=row, column=start_col + i, value=label)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = fill(ACCENT)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
        if widths:
            ws.column_dimensions[col(start_col + i)].width = widths[i]
    ws.row_dimensions[row].height = 22


def style_range(ws, rng, *, number_format=None, input_cell=False, bold=False):
    for row in ws[rng]:
        for c in row:
            c.border = BOX
            if number_format:
                c.number_format = number_format
            if input_cell:
                c.fill = fill(INPUT)
            if bold:
                c.font = Font(bold=True)


def label_value(ws, row, label, value, fmt=None, input_cell=False, lcol=2):
    lc = ws.cell(row=row, column=lcol, value=label)
    lc.font = Font(bold=True, color=INK)
    vc = ws.cell(row=row, column=lcol + 1, value=value)
    vc.border = BOX
    if fmt:
        vc.number_format = fmt
    if input_cell:
        vc.fill = fill(INPUT)
    return vc


def kpi(ws, row, column, label, formula, fmt=MONEY):
    lc = ws.cell(row=row, column=column, value=label)
    lc.font = Font(size=9, bold=True, color=MUTED)
    vc = ws.cell(row=row + 1, column=column, value=formula)
    vc.font = Font(size=16, bold=True, color=INK)
    vc.number_format = fmt
    for r in (row, row + 1):
        ws.cell(row=r, column=column).fill = fill(ACCENT_LIGHT)
    ws.row_dimensions[row + 1].height = 26


def howto(wb, product, steps):
    ws = wb.create_sheet("Start Here", 0)
    title(ws, product, f"{BRAND} · Thank you for your purchase!")
    ws.column_dimensions["B"].width = 100
    ws["B5"] = "How to use this template"
    ws["B5"].font = Font(size=13, bold=True, color=ACCENT)
    r = 6
    for i, s in enumerate(steps, 1):
        ws.cell(row=r, column=2, value=f"{i}. {s}").alignment = Alignment(wrap_text=True, vertical="top")
        r += 1
    r += 1
    tips = [
        "Yellow cells are inputs. Everything else is calculated for you.",
        "Google Sheets: go to sheets.new > File > Import > Upload this file.",
        "Excel and Apple Numbers work too. Keep a blank copy before you start.",
        "Replace the sample data with your own. Delete sample rows; formulas keep working.",
    ]
    ws.cell(row=r, column=2, value="Tips").font = Font(size=13, bold=True, color=ACCENT)
    for t in tips:
        r += 1
        c = ws.cell(row=r, column=2, value="• " + t)
        c.alignment = Alignment(wrap_text=True)
    r += 2
    ws.cell(row=r, column=2, value="Personal use license. Please do not resell or share the file.").font = Font(size=9, color=MUTED)
    return ws


def list_validation(ws, formula, rng):
    dv = DataValidation(type="list", formula1=formula, allow_blank=True)
    dv.error = "Pick a value from the list (edit the list on the Setup sheet)."
    ws.add_data_validation(dv)
    dv.add(rng)


# ---------------------------------------------------------------- budget

def budget_planner(out):
    wb = Workbook()
    setup = wb.active
    setup.title = "Setup"
    title(setup, "Budget Setup", "Set your year, currency and monthly budget per category.")
    year = label_value(setup, 5, "Year", 2027, input_cell=True)
    label_value(setup, 6, "Currency symbol", "$", input_cell=True)
    setup.column_dimensions["B"].width = 26
    setup.column_dimensions["C"].width = 16

    income = [("Salary", 4200), ("Side income", 600), ("Other income", 0)]
    expenses = [("Rent / Mortgage", 1450), ("Utilities", 220), ("Groceries", 520),
                ("Transport", 260), ("Insurance", 180), ("Phone & Internet", 90),
                ("Dining out", 200), ("Shopping", 150), ("Health", 80),
                ("Subscriptions", 45), ("Entertainment", 120), ("Gifts", 60),
                ("Savings transfer", 600), ("Debt payments", 300), ("Other", 100)]
    header(setup, 8, 2, ["Income category", "Monthly budget"])
    r = 9
    for name, amt in income + [("", None)] * 3:
        setup.cell(row=r, column=2, value=name or None)
        setup.cell(row=r, column=3, value=amt)
        r += 1
    style_range(setup, "B9:C14", input_cell=True)
    style_range(setup, "C9:C14", number_format=MONEY)
    header(setup, 16, 2, ["Expense category", "Monthly budget"])
    r = 17
    for name, amt in expenses + [("", None)] * 5:
        setup.cell(row=r, column=2, value=name or None)
        setup.cell(row=r, column=3, value=amt)
        r += 1
    style_range(setup, "B17:C36", input_cell=True)
    style_range(setup, "C17:C36", number_format=MONEY)

    # Categories list used by dropdowns (income + expense)
    setup["E8"] = "All categories (auto)"
    setup["E8"].font = Font(bold=True, color=MUTED)
    setup.column_dimensions["E"].width = 24
    for i in range(6):
        setup.cell(row=9 + i, column=5, value=f'=IF(B{9+i}="","",B{9+i})')
    for i in range(20):
        setup.cell(row=15 + i, column=5, value=f'=IF(B{17+i}="","",B{17+i})')

    tx = wb.create_sheet("Transactions")
    title(tx, "Transactions", "Log every income and expense. Type and category come from the dropdowns.")
    header(tx, 5, 2, ["Date", "Description", "Type", "Category", "Amount", "Month"],
           [13, 32, 11, 22, 14, 9])
    sample = [
        (1, 1, "Paycheck", "Income", "Salary", 2100), (1, 1, "Rent", "Expense", "Rent / Mortgage", 1450),
        (1, 3, "Supermarket", "Expense", "Groceries", 134.20), (1, 5, "Electric bill", "Expense", "Utilities", 96.40),
        (1, 7, "Bus pass", "Expense", "Transport", 85), (1, 9, "Streaming", "Expense", "Subscriptions", 15.99),
        (1, 12, "Dinner with friends", "Expense", "Dining out", 64.50), (1, 15, "Paycheck", "Income", "Salary", 2100),
        (1, 16, "Supermarket", "Expense", "Groceries", 118.75), (1, 18, "Freelance logo", "Income", "Side income", 450),
        (1, 20, "Car insurance", "Expense", "Insurance", 180), (1, 22, "Pharmacy", "Expense", "Health", 32.10),
        (1, 25, "Savings", "Expense", "Savings transfer", 600), (1, 26, "Card payment", "Expense", "Debt payments", 300),
        (1, 28, "New shoes", "Expense", "Shopping", 89.99), (1, 29, "Supermarket", "Expense", "Groceries", 141.30),
        (2, 1, "Paycheck", "Income", "Salary", 2100), (2, 1, "Rent", "Expense", "Rent / Mortgage", 1450),
        (2, 4, "Supermarket", "Expense", "Groceries", 127.60), (2, 6, "Internet", "Expense", "Phone & Internet", 90),
        (2, 10, "Concert tickets", "Expense", "Entertainment", 110), (2, 14, "Valentine gift", "Expense", "Gifts", 55),
        (2, 15, "Paycheck", "Income", "Salary", 2100), (2, 18, "Supermarket", "Expense", "Groceries", 150.20),
    ]
    for i, (m, d, desc, typ, cat, amt) in enumerate(sample):
        r = 6 + i
        tx.cell(row=r, column=2, value=date(2027, m, d)).number_format = "yyyy-mm-dd"
        tx.cell(row=r, column=3, value=desc)
        tx.cell(row=r, column=4, value=typ)
        tx.cell(row=r, column=5, value=cat)
        tx.cell(row=r, column=6, value=amt)
    last = 1005
    for r in range(6, last + 1):
        tx.cell(row=r, column=7, value=f'=IF(B{r}="","",MONTH(B{r}))')
    style_range(tx, f"B6:F{last}", input_cell=True)
    style_range(tx, f"B6:B{last}", number_format="yyyy-mm-dd")
    style_range(tx, f"F6:F{last}", number_format=MONEY)
    style_range(tx, f"G6:G{last}")
    list_validation(tx, '"Income,Expense"', f"D6:D{last}")
    list_validation(tx, "=Setup!$E$9:$E$34", f"E6:E{last}")
    tx.freeze_panes = "B6"
    T = f"Transactions!$F$6:$F${last}"
    TC = f"Transactions!$E$6:$E${last}"
    TT = f"Transactions!$D$6:$D${last}"
    TM = f"Transactions!$G$6:$G${last}"
    TD = f"Transactions!$B$6:$B${last}"

    dash = wb.create_sheet("Dashboard", 1)
    title(dash, "Monthly Dashboard", "Pick a month in the yellow cell. Budget vs. actual updates instantly.")
    for c, w in zip("BCDEFGH", [24, 15, 15, 15, 12, 3, 15]):
        dash.column_dimensions[c].width = w
    label_value(dash, 5, "Month (1-12)", 1, input_cell=True)
    dv = DataValidation(type="whole", operator="between", formula1="1", formula2="12")
    dash.add_data_validation(dv)
    dv.add("C5")
    dash["D5"] = '=TEXT(DATE(Setup!$C$5,$C$5,1),"mmmm yyyy")'
    dash["D5"].font = Font(bold=True, color=ACCENT, size=12)
    month_sum = (lambda typ_or_cat, field: f'SUMIFS({T},{field},{typ_or_cat},{TM},$C$5,{TD},">="&DATE(Setup!$C$5,1,1),{TD},"<="&DATE(Setup!$C$5,12,31))')
    kpi(dash, 7, 2, "INCOME", "=" + month_sum('"Income"', TT))
    kpi(dash, 7, 3, "EXPENSES", "=" + month_sum('"Expense"', TT))
    kpi(dash, 7, 4, "LEFT OVER", "=B8-C8")
    kpi(dash, 7, 5, "SAVINGS RATE", '=IF(B8=0,0,D8/B8)', PCT)

    header(dash, 11, 2, ["Expense category", "Budget", "Actual", "Remaining", "% used"])
    for i in range(20):
        r = 12 + i
        s = 17 + i
        dash.cell(row=r, column=2, value=f'=IF(Setup!B{s}="","",Setup!B{s})')
        dash.cell(row=r, column=3, value=f'=IF(B{r}="","",Setup!C{s})')
        dash.cell(row=r, column=4, value=f'=IF(B{r}="","",' + month_sum(f"B{r}", TC) + ")")
        dash.cell(row=r, column=5, value=f'=IF(B{r}="","",C{r}-D{r})')
        dash.cell(row=r, column=6, value=f'=IF(OR(B{r}="",N(C{r})=0),"",D{r}/C{r})')
    style_range(dash, "B12:F31")
    style_range(dash, "C12:E31", number_format=MONEY)
    style_range(dash, "F12:F31", number_format=PCT)
    dash["B32"] = "Total"
    dash["C32"] = "=SUM(C12:C31)"
    dash["D32"] = "=SUM(D12:D31)"
    dash["E32"] = "=C32-D32"
    dash["F32"] = '=IF(C32=0,"",D32/C32)'
    style_range(dash, "B32:F32", bold=True)
    style_range(dash, "C32:E32", number_format=MONEY)
    dash["F32"].number_format = PCT
    dash.conditional_formatting.add("E12:E32", CellIsRule(operator="lessThan", formula=["0"], fill=fill(RED_LIGHT), font=Font(color=RED, bold=True)))
    dash.conditional_formatting.add("F12:F31", DataBarRule(start_type="num", start_value=0, end_type="num", end_value=1, color="7BC8A4"))

    chart = BarChart()
    chart.type = "bar"
    chart.title = "Budget vs. actual"
    chart.style = 10
    chart.height, chart.width = 11, 15
    chart.add_data(Reference(dash, min_col=3, max_col=4, min_row=11, max_row=26), titles_from_data=True)
    chart.set_categories(Reference(dash, min_col=2, min_row=12, max_row=26))
    chart.y_axis.majorGridlines = None
    dash.add_chart(chart, "H11")

    annual = wb.create_sheet("Annual Summary", 2)
    title(annual, "Annual Summary", "Every month at a glance. Calculated from the Transactions sheet.")
    annual.column_dimensions["B"].width = 24
    header(annual, 5, 2, ["Category"] + MONTHS + ["Total", "Monthly avg"],
           [24] + [11] * 12 + [13, 13])
    rows = [("Income", None)] + [(None, 9 + i) for i in range(6)] + [("Expenses", None)] + [(None, 17 + i) for i in range(20)]
    r = 6
    for label, src in rows:
        if label:
            annual.cell(row=r, column=2, value=label).font = Font(bold=True, color=ACCENT)
        else:
            annual.cell(row=r, column=2, value=f'=IF(Setup!B{src}="","",Setup!B{src})')
            for m in range(12):
                annual.cell(row=r, column=3 + m, value=f'=IF($B{r}="","",SUMIFS({T},{TC},$B{r},{TM},{m+1},{TD},">="&DATE(Setup!$C$5,1,1),{TD},"<="&DATE(Setup!$C$5,12,31)))')
            annual.cell(row=r, column=15, value=f'=IF($B{r}="","",SUM(C{r}:N{r}))')
            annual.cell(row=r, column=16, value=f'=IF($B{r}="","",O{r}/12)')
        r += 1
    style_range(annual, f"B6:P{r-1}", number_format=MONEY)
    for label, f in (("Total income", '"Income"'), ("Total expenses", '"Expense"')):
        annual.cell(row=r, column=2, value=label)
        for m in range(12):
            annual.cell(row=r, column=3 + m, value=f'=SUMIFS({T},{TT},{f},{TM},{m+1},{TD},">="&DATE(Setup!$C$5,1,1),{TD},"<="&DATE(Setup!$C$5,12,31))')
        annual.cell(row=r, column=15, value=f"=SUM(C{r}:N{r})")
        annual.cell(row=r, column=16, value=f"=O{r}/12")
        style_range(annual, f"B{r}:P{r}", number_format=MONEY, bold=True)
        r += 1
    annual.cell(row=r, column=2, value="Net (left over)")
    for c in range(3, 17):
        L = col(c)
        annual.cell(row=r, column=c, value=f"={L}{r-2}-{L}{r-1}")
    style_range(annual, f"B{r}:P{r}", number_format=MONEY, bold=True)
    for c in range(2, 17):
        annual.cell(row=r, column=c).fill = fill(ACCENT_LIGHT)
    net_row = r
    annual.freeze_panes = "C6"
    lc = LineChart()
    lc.title = "Income vs. expenses"
    lc.height, lc.width = 8, 22
    for rr in (net_row - 2, net_row - 1):
        lc.add_data(Reference(annual, min_col=2, max_col=14, min_row=rr), from_rows=True, titles_from_data=True)
    lc.set_categories(Reference(annual, min_col=3, max_col=14, min_row=5))
    annual.add_chart(lc, f"B{net_row + 3}")

    howto(wb, "Monthly Budget Planner", [
        "Open 'Setup': enter the year, your currency, and a monthly budget for each category. Rename or add categories freely.",
        "Open 'Transactions': log each income or expense with its date, type and category (use the dropdowns).",
        "Open 'Dashboard': type a month number (1-12) in the yellow cell to see budget vs. actual. Red cells mean you went over budget.",
        "Open 'Annual Summary' to see every month side by side, with totals and averages.",
    ])
    wb.active = 0
    wb.save(out / "Monthly-Budget-Planner.xlsx")


# ---------------------------------------------------------------- debt

def debt_payoff(out):
    N = 10
    MONTHS_MAX = 360
    wb = Workbook()
    ws = wb.active
    ws.title = "Debts"
    title(ws, "Debt Payoff Planner", "Snowball or Avalanche. Enter your debts and see your debt-free date.")
    label_value(ws, 5, "Start date", date(2027, 1, 1), "yyyy-mm-dd", True)
    label_value(ws, 6, "Extra payment / month", 250, MONEY, True)
    label_value(ws, 7, "Method", "Avalanche", input_cell=True)
    list_validation(ws, '"Snowball,Avalanche"', "C7")
    ws["D7"] = "Snowball = smallest balance first · Avalanche = highest interest first (saves the most)"
    ws["D7"].font = Font(size=9, color=MUTED)
    header(ws, 9, 2, ["Debt", "Balance", "APR %", "Min. payment", "Order", "Payoff month", "Paid off on", "Interest paid", "Total paid"],
           [24, 14, 9, 14, 8, 13, 14, 14, 14])
    ws.column_dimensions["L"].hidden = True  # sort key
    debts = [("Credit card A", 4200, 22.9, 110), ("Credit card B", 1350, 18.5, 40),
             ("Car loan", 9800, 6.9, 245), ("Student loan", 15400, 5.0, 170), ("Medical bill", 620, 0, 50)]
    for i in range(N):
        r = 10 + i
        if i < len(debts):
            for j, v in enumerate(debts[i]):
                ws.cell(row=r, column=2 + j, value=v)
        ws.cell(row=r, column=12, value=f'=IF(OR(B{r}="",N(C{r})<=0),10^12+ROW(),IF($C$7="Snowball",C{r},-D{r})+ROW()/10^6)')
        ws.cell(row=r, column=6, value=f'=IF(L{r}>=10^12,"",COUNTIF($L$10:$L${9+N},"<"&L{r})+1)')
    style_range(ws, f"B10:E{9+N}", input_cell=True)
    style_range(ws, f"C10:C{9+N}", number_format=MONEY)
    style_range(ws, f"E10:E{9+N}", number_format=MONEY)
    style_range(ws, f"F10:J{9+N}")
    style_range(ws, f"I10:J{9+N}", number_format=MONEY)
    style_range(ws, f"H10:H{9+N}", number_format="mmm yyyy")

    s = wb.create_sheet("Schedule")
    title(s, "Month-by-month schedule", "Calculated automatically. Balance of each debt at the end of every month.")
    # Column blocks: A month#, B date, then 5 blocks of N columns:
    # accrued (balance after interest), base (min payment), rem (room for extra), extra, end balance
    blk = {"acc": 4, "base": 4 + N, "rem": 4 + 2 * N, "ext": 4 + 3 * N, "end": 4 + 4 * N}
    tot_col = 4 + 5 * N
    R0 = 6  # first schedule row; row R0-1 = starting balances
    s.cell(row=4, column=2, value="Month")
    s.cell(row=4, column=3, value="Date")
    for name, start in blk.items():
        s.cell(row=3, column=start, value={"acc": "Balance + interest", "base": "Minimum paid", "rem": "Room for extra",
                                            "ext": "Extra paid", "end": "End balance"}[name]).font = Font(bold=True, color=ACCENT)
    for j in range(N):
        for start in blk.values():
            c = s.cell(row=4, column=start + j, value=f'=IF(Debts!$B${10+j}="","Debt {j+1}",Debts!$B${10+j})')
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = fill(ACCENT)
            s.column_dimensions[col(start + j)].width = 12
        s.cell(row=R0 - 1, column=blk["end"] + j, value=f"=N(Debts!$C${10+j})")
        s.cell(row=R0 - 1, column=blk["rem"] + j, value=f"=Debts!$F${10+j}")  # payoff order, used for rollover
    s.cell(row=4, column=tot_col, value="Total balance").font = Font(bold=True)
    s.cell(row=4, column=tot_col + 1, value="Money for extra").font = Font(bold=True)
    s.cell(row=R0 - 1, column=tot_col, value=f"=SUM({col(blk['end'])}{R0-1}:{col(blk['end']+N-1)}{R0-1})")
    acc0, accN = col(blk["acc"]), col(blk["acc"] + N - 1)
    base0, baseN = col(blk["base"]), col(blk["base"] + N - 1)
    rem0, remN = col(blk["rem"]), col(blk["rem"] + N - 1)
    for m in range(1, MONTHS_MAX + 1):
        r = R0 + m - 1
        s.cell(row=r, column=2, value=m)
        s.cell(row=r, column=3, value=f"=EDATE(Debts!$C$5,{m-1})").number_format = "mmm yyyy"
        pc = col(tot_col + 1)
        s[f"{pc}{r}"] = f"=Debts!$C$6+SUM(Debts!$E$10:$E${9+N})-SUM({base0}{r}:{baseN}{r})"
        pool = f"${pc}{r}"
        for j in range(N):
            prev_end = f"{col(blk['end']+j)}{r-1}"
            a = col(blk["acc"] + j)
            b = col(blk["base"] + j)
            rm = col(blk["rem"] + j)
            e = col(blk["ext"] + j)
            dr = 10 + j
            s[f"{a}{r}"] = f"=ROUND({prev_end}*(1+N(Debts!$D${dr})/1200),2)"
            s[f"{b}{r}"] = f"=MIN({a}{r},N(Debts!$E${dr}))"
            s[f"{rm}{r}"] = f"={a}{r}-{b}{r}"
            s[f"{e}{r}"] = (f'=IF(Debts!$F${dr}="",0,MAX(0,MIN({rm}{r},{pool}'
                           f'-SUMPRODUCT((${rem0}$5:${remN}$5<{rm}$5)*${rem0}{r}:${remN}{r}))))')
            s[f"{col(blk['end']+j)}{r}"] = f"=ROUND({a}{r}-{b}{r}-{e}{r},2)"
        s.cell(row=r, column=tot_col, value=f"=SUM({col(blk['end'])}{r}:{col(blk['end']+N-1)}{r})")
    last = R0 + MONTHS_MAX - 1
    s.freeze_panes = s.cell(row=R0, column=4)
    for c in range(4, tot_col + 2):
        for r in range(R0 - 1, last + 1):
            s.cell(row=r, column=c).number_format = '#,##0.00'

    # Results back on the Debts sheet
    for j in range(N):
        r = 10 + j
        end_rng = f"Schedule!{col(blk['end']+j)}{R0}:{col(blk['end']+j)}{last}"
        base_rng = f"Schedule!{col(blk['base']+j)}{R0}:{col(blk['base']+j)}{last}"
        ext_rng = f"Schedule!{col(blk['ext']+j)}{R0}:{col(blk['ext']+j)}{last}"
        ws[f"G{r}"] = f'=IF(F{r}="","",IFERROR(MATCH(TRUE,INDEX({end_rng}<=0.004,0),0),"30y+"))'
        ws[f"H{r}"] = f'=IF(ISNUMBER(G{r}),EDATE($C$5,G{r}-1),"")'
        ws[f"J{r}"] = f'=IF(F{r}="","",SUM({base_rng})+SUM({ext_rng}))'
        ws[f"I{r}"] = f'=IF(F{r}="","",J{r}-C{r})'
    tr = 11 + N
    ws[f"B{tr}"] = "Total"
    ws[f"C{tr}"] = f"=SUM(C10:C{9+N})"
    ws[f"E{tr}"] = f"=SUM(E10:E{9+N})"
    ws[f"I{tr}"] = f"=SUM(I10:I{9+N})"
    ws[f"J{tr}"] = f"=SUM(J10:J{9+N})"
    style_range(ws, f"B{tr}:J{tr}", bold=True)
    for c in "CEIJ":
        ws[f"{c}{tr}"].number_format = MONEY

    kr = tr + 2
    kpi(ws, kr, 2, "DEBT-FREE DATE", f'=IF(COUNT(G10:G{9+N})<COUNTIF(F10:F{9+N},">0"),"30y+",EDATE(C5,MAX(G10:G{9+N})-1))', "mmmm yyyy")
    kpi(ws, kr, 3, "MONTHS", f'=IF(COUNT(G10:G{9+N})<COUNTIF(F10:F{9+N},">0"),"30y+",MAX(G10:G{9+N}))', "0")
    kpi(ws, kr, 5, "TOTAL INTEREST", f"=I{tr}")
    kpi(ws, kr, 8, "MONTHLY PAYMENT", f"=E{tr}+C6")
    ws[f"B{kr+3}"] = "Tip: switch Method between Snowball and Avalanche and compare the total interest."
    ws[f"B{kr+3}"].font = Font(italic=True, color=MUTED)

    lc = LineChart()
    lc.title = "Total debt over time"
    lc.height, lc.width = 8, 22
    lc.legend = None
    lc.add_data(Reference(s, min_col=tot_col, min_row=R0 - 1, max_row=R0 + 120))
    lc.set_categories(Reference(s, min_col=2, min_row=R0 - 1, max_row=R0 + 120))
    lc.x_axis.title = "Month"
    ws.add_chart(lc, f"B{kr+5}")

    howto(wb, "Debt Payoff Planner", [
        "Open 'Debts': enter the start date, any extra amount you can pay each month, and pick Snowball or Avalanche.",
        "List up to 10 debts with balance, APR (yearly interest %) and minimum monthly payment.",
        "Read your debt-free date, total interest and the payoff month of every debt. The 'Order' column is your attack order.",
        "When a debt is paid off, its minimum payment rolls over to the next one automatically ('Schedule' shows every month).",
    ])
    wb.active = 0
    wb.save(out / "Debt-Payoff-Planner.xlsx")


# ---------------------------------------------------------------- business

def business_tracker(out):
    wb = Workbook()
    st = wb.active
    st.title = "Setup"
    title(st, "Business Setup", "Your business details, categories and tax set-aside rate.")
    st.column_dimensions["B"].width = 30
    st.column_dimensions["C"].width = 18
    label_value(st, 5, "Business name", "Your Business LLC", input_cell=True)
    label_value(st, 6, "Year", 2027, input_cell=True)
    label_value(st, 7, "Tax set-aside rate", 0.25, PCT, True)
    st["D7"] = "Estimate only. Ask a tax professional for your real rate."
    st["D7"].font = Font(size=9, color=MUTED)
    header(st, 9, 2, ["Income categories"])
    inc = ["Product sales", "Services", "Consulting", "Affiliate income", "Refunds received", "Other income"]
    for i in range(10):
        st.cell(row=10 + i, column=2, value=inc[i] if i < len(inc) else None)
    style_range(st, "B10:B19", input_cell=True)
    header(st, 21, 2, ["Expense categories"])
    exp = ["Advertising", "Software & subscriptions", "Supplies & materials", "Shipping & postage",
           "Platform & payment fees", "Contractors", "Office & rent", "Phone & internet",
           "Travel", "Meals", "Education", "Bank fees", "Insurance", "Equipment", "Other expenses"]
    for i in range(20):
        st.cell(row=22 + i, column=2, value=exp[i] if i < len(exp) else None)
    style_range(st, "B22:B41", input_cell=True)
    header(st, 9, 4, ["Payment methods"], [20])
    for i, p in enumerate(["Bank transfer", "Card", "Cash", "PayPal", "Stripe", "Other"]):
        st.cell(row=10 + i, column=4, value=p)
    style_range(st, "D10:D19", input_cell=True)

    L = 2004
    led = wb.create_sheet("Ledger")
    title(led, "Income & Expense Ledger", "One row per transaction. Use the dropdowns for type and category.")
    header(led, 5, 2, ["Date", "Description", "Type", "Category", "Amount", "Payment method", "Invoice / receipt #", "Month"],
           [13, 32, 11, 26, 14, 16, 18, 8])
    sample = [
        (1, 3, "Etsy payout", "Income", "Product sales", 1240.50, "Bank transfer"),
        (1, 4, "Canva Pro", "Expense", "Software & subscriptions", 14.99, "Card"),
        (1, 6, "Packaging boxes", "Expense", "Supplies & materials", 86.40, "Card"),
        (1, 9, "Website client - deposit", "Income", "Services", 800, "Bank transfer"),
        (1, 11, "Facebook ads", "Expense", "Advertising", 120, "Card"),
        (1, 15, "USPS labels", "Expense", "Shipping & postage", 64.25, "Card"),
        (1, 18, "Etsy fees", "Expense", "Platform & payment fees", 98.70, "Bank transfer"),
        (1, 24, "Website client - final", "Income", "Services", 800, "Stripe"),
        (1, 28, "Internet", "Expense", "Phone & internet", 60, "Card"),
        (2, 3, "Etsy payout", "Income", "Product sales", 1385.20, "Bank transfer"),
        (2, 5, "Freelance designer", "Expense", "Contractors", 300, "PayPal"),
        (2, 10, "Strategy call", "Income", "Consulting", 250, "PayPal"),
        (2, 12, "Packaging boxes", "Expense", "Supplies & materials", 92.10, "Card"),
        (2, 20, "Online course", "Expense", "Education", 49, "Card"),
        (3, 2, "Etsy payout", "Income", "Product sales", 1610.80, "Bank transfer"),
        (3, 7, "Google ads", "Expense", "Advertising", 150, "Card"),
    ]
    for i, (m, d, desc, typ, cat, amt, pm) in enumerate(sample):
        r = 6 + i
        led.cell(row=r, column=2, value=date(2027, m, d))
        for c, v in zip(range(3, 8), (desc, typ, cat, amt, pm)):
            led.cell(row=r, column=c, value=v)
        led.cell(row=r, column=8, value=f"INV-{1001+i}")
    for r in range(6, L + 1):
        led.cell(row=r, column=9, value=f'=IF(B{r}="","",MONTH(B{r}))')
    style_range(led, f"B6:H{L}", input_cell=True)
    style_range(led, f"B6:B{L}", number_format="yyyy-mm-dd")
    style_range(led, f"F6:F{L}", number_format=MONEY)
    style_range(led, f"I6:I{L}")
    st["F9"] = "All categories (auto)"
    st["F9"].font = Font(bold=True, color=MUTED)
    st.column_dimensions["F"].width = 26
    for i in range(10):
        st.cell(row=10 + i, column=6, value=f'=IF(B{10+i}="","",B{10+i})')
    for i in range(20):
        st.cell(row=20 + i, column=6, value=f'=IF(B{22+i}="","",B{22+i})')
    list_validation(led, '"Income,Expense"', f"D6:D{L}")
    list_validation(led, "=Setup!$F$10:$F$39", f"E6:E{L}")
    list_validation(led, "=Setup!$D$10:$D$19", f"G6:G{L}")
    led.freeze_panes = "B6"
    A = f"Ledger!$F$6:$F${L}"
    C = f"Ledger!$E$6:$E${L}"
    TY = f"Ledger!$D$6:$D${L}"
    M = f"Ledger!$I$6:$I${L}"
    D = f"Ledger!$B$6:$B${L}"
    yr = f'{D},">="&DATE(Setup!$C$6,1,1),{D},"<="&DATE(Setup!$C$6,12,31)'

    pl = wb.create_sheet("Profit & Loss")
    title(pl, "Profit & Loss", "Monthly P&L by category, calculated from the Ledger.")
    header(pl, 5, 2, ["Category"] + MONTHS + ["Year total"], [28] + [11] * 12 + [13])
    r = 6
    pl.cell(row=r, column=2, value="INCOME").font = Font(bold=True, color=ACCENT)
    r += 1
    inc_first = r
    for i in range(10):
        pl.cell(row=r, column=2, value=f'=IF(Setup!B{10+i}="","",Setup!B{10+i})')
        for m in range(12):
            pl.cell(row=r, column=3 + m, value=f'=IF($B{r}="","",SUMIFS({A},{C},$B{r},{TY},"Income",{M},{m+1},{yr}))')
        pl.cell(row=r, column=15, value=f'=IF($B{r}="","",SUM(C{r}:N{r}))')
        r += 1
    inc_tot = r
    pl.cell(row=r, column=2, value="Total income")
    for c in range(3, 16):
        pl.cell(row=r, column=c, value=f"=SUM({col(c)}{inc_first}:{col(c)}{r-1})")
    style_range(pl, f"B{r}:O{r}", bold=True)
    r += 2
    pl.cell(row=r, column=2, value="EXPENSES").font = Font(bold=True, color=ACCENT)
    r += 1
    exp_first = r
    for i in range(20):
        pl.cell(row=r, column=2, value=f'=IF(Setup!B{22+i}="","",Setup!B{22+i})')
        for m in range(12):
            pl.cell(row=r, column=3 + m, value=f'=IF($B{r}="","",SUMIFS({A},{C},$B{r},{TY},"Expense",{M},{m+1},{yr}))')
        pl.cell(row=r, column=15, value=f'=IF($B{r}="","",SUM(C{r}:N{r}))')
        r += 1
    exp_tot = r
    pl.cell(row=r, column=2, value="Total expenses")
    for c in range(3, 16):
        pl.cell(row=r, column=c, value=f"=SUM({col(c)}{exp_first}:{col(c)}{r-1})")
    style_range(pl, f"B{r}:O{r}", bold=True)
    r += 2
    net = r
    pl.cell(row=r, column=2, value="Net profit")
    for c in range(3, 16):
        pl.cell(row=r, column=c, value=f"={col(c)}{inc_tot}-{col(c)}{exp_tot}")
    pl.cell(row=r + 1, column=2, value="Set aside for tax")
    for c in range(3, 16):
        pl.cell(row=r + 1, column=c, value=f"=MAX(0,{col(c)}{net})*Setup!$C$7")
    pl.cell(row=r + 2, column=2, value="Profit margin")
    for c in range(3, 16):
        pl.cell(row=r + 2, column=c, value=f'=IF({col(c)}{inc_tot}=0,"",{col(c)}{net}/{col(c)}{inc_tot})')
    style_range(pl, f"B6:O{r+2}", number_format=MONEY)
    style_range(pl, f"C{r+2}:O{r+2}", number_format=PCT)
    style_range(pl, f"B{r}:O{r}", bold=True)
    for c in range(2, 16):
        pl.cell(row=r, column=c).fill = fill(ACCENT_LIGHT)
    pl.freeze_panes = "C6"

    dash = wb.create_sheet("Dashboard", 1)
    title(dash, "Business Dashboard", "Year-to-date overview.")
    dash["B3"] = '=Setup!C5&" · "&Setup!C6&" · year to date"'
    for c, w in zip("BCDEF", [18, 18, 18, 18, 18]):
        dash.column_dimensions[c].width = w
    kpi(dash, 5, 2, "INCOME", f"='Profit & Loss'!O{inc_tot}")
    kpi(dash, 5, 3, "EXPENSES", f"='Profit & Loss'!O{exp_tot}")
    kpi(dash, 5, 4, "NET PROFIT", f"='Profit & Loss'!O{net}")
    kpi(dash, 5, 5, "TAX SET-ASIDE", f"='Profit & Loss'!O{net+1}")
    kpi(dash, 5, 6, "MARGIN", f"='Profit & Loss'!O{net+2}", PCT)
    header(dash, 9, 2, ["Month", "Income", "Expenses", "Profit"])
    for m in range(12):
        rr = 10 + m
        c = col(3 + m)
        dash.cell(row=rr, column=2, value=MONTHS[m])
        dash.cell(row=rr, column=3, value=f"='Profit & Loss'!{c}{inc_tot}")
        dash.cell(row=rr, column=4, value=f"='Profit & Loss'!{c}{exp_tot}")
        dash.cell(row=rr, column=5, value=f"='Profit & Loss'!{c}{net}")
    style_range(dash, "B10:E21")
    style_range(dash, "C10:E21", number_format=MONEY)
    dash.conditional_formatting.add("E10:E21", CellIsRule(operator="lessThan", formula=["0"], font=Font(color=RED, bold=True)))
    bc = BarChart()
    bc.title = "Income vs. expenses by month"
    bc.height, bc.width = 9, 18
    bc.add_data(Reference(dash, min_col=3, max_col=4, min_row=9, max_row=21), titles_from_data=True)
    bc.set_categories(Reference(dash, min_col=2, min_row=10, max_row=21))
    dash.add_chart(bc, "G9")
    header(dash, 24, 2, ["Top expenses", "Year total"])
    for i in range(20):
        rr = 25 + i
        src = exp_first + i
        dash.cell(row=rr, column=2, value=f"='Profit & Loss'!B{src}")
        dash.cell(row=rr, column=3, value=f"='Profit & Loss'!O{src}")
    style_range(dash, "B25:C44")
    style_range(dash, "C25:C44", number_format=MONEY)
    dash.conditional_formatting.add("C25:C44", DataBarRule(start_type="min", end_type="max", color="7BC8A4"))
    dc = DoughnutChart()
    dc.title = "Where the money goes"
    dc.height, dc.width = 9, 12
    dc.add_data(Reference(dash, min_col=3, min_row=25, max_row=39))
    dc.set_categories(Reference(dash, min_col=2, min_row=25, max_row=39))
    dash.add_chart(dc, "E24")

    howto(wb, "Small Business Income & Expense Tracker", [
        "Open 'Setup': enter your business name, the year and a tax set-aside rate. Edit the category and payment-method lists.",
        "Open 'Ledger': record every sale and every expense (up to 2,000 rows). Keep the invoice or receipt number for your records.",
        "Open 'Dashboard' for year-to-date income, expenses, profit and how much to put aside for taxes.",
        "Open 'Profit & Loss' for a month-by-month P&L by category. Handy at tax time.",
    ])
    wb.active = 0
    wb.save(out / "Small-Business-Income-Expense-Tracker.xlsx")


# ---------------------------------------------------------------- savings

def savings_goals(out):
    wb = Workbook()
    g = wb.active
    g.title = "Goals"
    title(g, "Savings Goals Tracker", "Set goals, log deposits, and see how much to save each month.")
    label_value(g, 5, "Today", "=TODAY()", "yyyy-mm-dd")
    header(g, 7, 2, ["Goal", "Target", "Deadline", "Saved", "Remaining", "Progress", "Months left", "Save per month", "Status"],
           [26, 13, 13, 13, 13, 11, 11, 15, 14])
    goals = [("Emergency fund", 6000, date(2027, 12, 31)), ("Vacation", 2500, date(2027, 7, 1)),
             ("New laptop", 1400, date(2027, 5, 1)), ("House deposit", 25000, date(2030, 1, 1))]
    DL = 1003
    Damt = f"Deposits!$D$6:$D${DL}"
    Dg = f"Deposits!$C$6:$C${DL}"
    for i in range(12):
        r = 8 + i
        if i < len(goals):
            for j, v in enumerate(goals[i]):
                g.cell(row=r, column=2 + j, value=v)
        g[f"E{r}"] = f'=IF(B{r}="","",SUMIFS({Damt},{Dg},B{r}))'
        g[f"F{r}"] = f'=IF(B{r}="","",MAX(0,C{r}-E{r}))'
        g[f"G{r}"] = f'=IF(OR(B{r}="",N(C{r})=0),"",MIN(1,E{r}/C{r}))'
        g[f"H{r}"] = f'=IF(OR(B{r}="",D{r}=""),"",MAX(0,(YEAR(D{r})-YEAR($C$5))*12+MONTH(D{r})-MONTH($C$5)))'
        g[f"I{r}"] = f'=IF(OR(B{r}="",D{r}=""),"",IF(F{r}=0,0,F{r}/MAX(1,H{r})))'
        g[f"J{r}"] = f'=IF(B{r}="","",IF(F{r}=0,"Reached!",IF(D{r}<$C$5,"Overdue","On the way")))'
    style_range(g, "B8:D19", input_cell=True)
    style_range(g, "E8:J19")
    for c in "CEFI":
        style_range(g, f"{c}8:{c}19", number_format=MONEY)
    style_range(g, "D8:D19", number_format="yyyy-mm-dd")
    style_range(g, "G8:G19", number_format=PCT)
    g.conditional_formatting.add("G8:G19", DataBarRule(start_type="num", start_value=0, end_type="num", end_value=1, color="7BC8A4"))
    g.conditional_formatting.add("J8:J19", FormulaRule(formula=['$J8="Reached!"'], fill=fill(ACCENT_LIGHT), font=Font(color=ACCENT, bold=True)))
    g.conditional_formatting.add("J8:J19", FormulaRule(formula=['$J8="Overdue"'], fill=fill(RED_LIGHT), font=Font(color=RED, bold=True)))
    g["B21"] = "Total"
    for c in "CEFI":
        g[f"{c}21"] = f"=SUM({c}8:{c}19)"
        g[f"{c}21"].number_format = MONEY
    g["G21"] = '=IF(C21=0,"",E21/C21)'
    g["G21"].number_format = PCT
    style_range(g, "B21:J21", bold=True)
    kpi(g, 23, 2, "TOTAL SAVED", "=E21")
    kpi(g, 23, 3, "STILL TO SAVE", "=F21")
    kpi(g, 23, 5, "SAVE / MONTH", "=I21")
    kpi(g, 23, 7, "OVERALL", "=G21", PCT)
    bc = BarChart()
    bc.type = "bar"
    bc.grouping = "stacked"
    bc.overlap = 100
    bc.title = "Saved vs. remaining"
    bc.height, bc.width = 8, 16
    bc.add_data(Reference(g, min_col=5, max_col=6, min_row=7, max_row=11), titles_from_data=True)
    bc.set_categories(Reference(g, min_col=2, min_row=8, max_row=11))
    g.add_chart(bc, "L7")

    d = wb.create_sheet("Deposits")
    title(d, "Deposits", "Log every deposit (or a negative amount for a withdrawal).")
    header(d, 5, 2, ["Date", "Goal", "Amount", "Note"], [13, 26, 13, 30])
    dep = [(1, 3, "Emergency fund", 400), (1, 3, "Vacation", 150), (1, 17, "New laptop", 200),
           (2, 3, "Emergency fund", 400), (2, 3, "Vacation", 150), (2, 17, "New laptop", 200),
           (3, 3, "Emergency fund", 400), (3, 3, "House deposit", 500), (3, 10, "Vacation", -60)]
    for i, (m, dd, goal, amt) in enumerate(dep):
        r = 6 + i
        d.cell(row=r, column=2, value=date(2027, m, dd))
        d.cell(row=r, column=3, value=goal)
        d.cell(row=r, column=4, value=amt)
        if amt < 0:
            d.cell(row=r, column=5, value="Took some out for flights")
    style_range(d, f"B6:E{DL}", input_cell=True)
    style_range(d, f"B6:B{DL}", number_format="yyyy-mm-dd")
    style_range(d, f"D6:D{DL}", number_format=MONEY)
    list_validation(d, "=Goals!$B$8:$B$19", f"C6:C{DL}")
    d.freeze_panes = "B6"

    howto(wb, "Savings Goals Tracker", [
        "Open 'Goals': enter up to 12 goals with a target amount and a deadline.",
        "Open 'Deposits': every time you save, add a row with the date, goal and amount.",
        "Back on 'Goals' see your progress bars, what is left and how much to save per month to hit each deadline.",
    ])
    wb.active = 0
    wb.save(out / "Savings-Goals-Tracker.xlsx")


# ---------------------------------------------------------------- holiday

def holiday_budget(out):
    wb = Workbook()
    st = wb.active
    st.title = "Setup"
    title(st, "Holiday Budget Setup", "Set your total holiday budget and the groups you buy gifts for.")
    st.column_dimensions["B"].width = 28
    st.column_dimensions["C"].width = 16
    label_value(st, 5, "Season", "Holidays 2026", input_cell=True)
    label_value(st, 6, "Total holiday budget", 1500, MONEY, True)
    header(st, 8, 2, ["Gift groups"])
    for i, g in enumerate(["Family", "Kids", "Friends", "Work", "Teachers & helpers", "Other"] + [None] * 4):
        st.cell(row=9 + i, column=2, value=g)
    style_range(st, "B9:B18", input_cell=True)

    G = 108
    gl = wb.create_sheet("Gift List")
    title(gl, "Gift List", "One row per person. Tick Bought and Wrapped as you go.")
    header(gl, 5, 2, ["Person", "Group", "Gift idea", "Budget", "Actual cost", "Bought?", "Wrapped?", "Store / link"],
           [20, 18, 28, 12, 12, 10, 10, 26])
    gifts = [("Mom", "Family", "Cashmere scarf", 80, 72, "Yes", "Yes"), ("Dad", "Family", "Coffee grinder", 70, 0, "No", "No"),
             ("Sister", "Family", "Book set", 40, 38.5, "Yes", "No"), ("Leo", "Kids", "LEGO set", 60, 64.99, "Yes", "Yes"),
             ("Mia", "Kids", "Art kit", 35, 0, "No", "No"), ("Anna", "Friends", "Candle + mug", 30, 27, "Yes", "No"),
             ("Sam", "Friends", "Board game", 35, 0, "No", "No"), ("Team", "Work", "Cookies", 25, 0, "No", "No"),
             ("Ms. Lee", "Teachers & helpers", "Gift card", 25, 25, "Yes", "Yes")]
    for i, row in enumerate(gifts):
        for j, v in enumerate(row):
            gl.cell(row=6 + i, column=2 + j, value=v)
    style_range(gl, f"B6:I{G}", input_cell=True)
    style_range(gl, f"E6:F{G}", number_format=MONEY)
    list_validation(gl, "=Setup!$B$9:$B$18", f"C6:C{G}")
    list_validation(gl, '"Yes,No"', f"G6:H{G}")
    gl.conditional_formatting.add(f"B6:I{G}", FormulaRule(formula=['$G6="Yes"'], fill=fill(ACCENT_LIGHT)))
    gl.conditional_formatting.add(f"F6:F{G}", FormulaRule(formula=['AND(N($F6)>0,N($F6)>N($E6))'], fill=fill(RED_LIGHT), font=Font(color=RED, bold=True)))
    gl.freeze_panes = "B6"

    oe = wb.create_sheet("Other Costs")
    title(oe, "Other Holiday Costs", "Food, decorations, travel and everything that isn't a gift.")
    header(oe, 5, 2, ["Category", "Budget", "Actual", "Remaining"], [26, 13, 13, 13])
    other = [("Food & dinners", 250, 120), ("Decorations", 80, 45), ("Wrapping & cards", 40, 18), ("Postage & shipping", 30, 0),
             ("Travel", 200, 0), ("Parties & events", 100, 0), ("Charity", 50, 25), ("Other", 50, 0)]
    for i in range(14):
        r = 6 + i
        if i < len(other):
            for j, v in enumerate(other[i]):
                oe.cell(row=r, column=2 + j, value=v)
        oe.cell(row=r, column=5, value=f'=IF(B{r}="","",N(C{r})-N(D{r}))')
    style_range(oe, "B6:D19", input_cell=True)
    style_range(oe, "C6:E19", number_format=MONEY)
    oe.conditional_formatting.add("E6:E19", CellIsRule(operator="lessThan", formula=["0"], fill=fill(RED_LIGHT), font=Font(color=RED, bold=True)))
    oe["B20"] = "Total"
    for c in "CDE":
        oe[f"{c}20"] = f"=SUM({c}6:{c}19)"
    style_range(oe, "B20:E20", bold=True)
    style_range(oe, "C20:E20", number_format=MONEY)

    dash = wb.create_sheet("Dashboard", 0)
    title(dash, "Holiday Budget Dashboard", "Everything updates from the Gift List and Other Costs sheets.")
    dash["B3"] = '=Setup!C5&" · holiday budget overview"'
    for c, w in zip("BCDEF", [22, 16, 16, 16, 16]):
        dash.column_dimensions[c].width = w
    gb = f"'Gift List'!$E$6:$E${G}"
    ga = f"'Gift List'!$F$6:$F${G}"
    gg = f"'Gift List'!$C$6:$C${G}"
    kpi(dash, 5, 2, "TOTAL BUDGET", "=Setup!C6")
    kpi(dash, 5, 3, "PLANNED", f"=SUM({gb})+'Other Costs'!C20")
    kpi(dash, 5, 4, "SPENT SO FAR", f"=SUM({ga})+'Other Costs'!D20")
    kpi(dash, 5, 5, "LEFT TO SPEND", "=B6-D6")
    kpi(dash, 5, 6, "GIFTS BOUGHT", f"=COUNTIF('Gift List'!$G$6:$G${G},\"Yes\")&\" / \"&COUNTA('Gift List'!$B$6:$B${G})", "@")
    dash.conditional_formatting.add("E6", CellIsRule(operator="lessThan", formula=["0"], font=Font(color=RED, bold=True, size=16)))
    dash["B8"] = '=IF(C6>B6,"⚠ Your plan is "&TEXT(C6-B6,"#,##0")&" over the total budget. Trim a few gifts or costs.","✓ Your plan fits the total budget.")'
    dash["B8"].font = Font(bold=True, color=ACCENT)
    header(dash, 10, 2, ["Gift group", "People", "Budget", "Spent", "Remaining"])
    for i in range(10):
        r = 11 + i
        dash.cell(row=r, column=2, value=f'=IF(Setup!B{9+i}="","",Setup!B{9+i})')
        dash.cell(row=r, column=3, value=f'=IF(B{r}="","",COUNTIF({gg},B{r}))')
        dash.cell(row=r, column=4, value=f'=IF(B{r}="","",SUMIFS({gb},{gg},B{r}))')
        dash.cell(row=r, column=5, value=f'=IF(B{r}="","",SUMIFS({ga},{gg},B{r}))')
        dash.cell(row=r, column=6, value=f'=IF(B{r}="","",D{r}-E{r})')
    style_range(dash, "B11:F20")
    style_range(dash, "D11:F20", number_format=MONEY)
    dash.conditional_formatting.add("F11:F20", CellIsRule(operator="lessThan", formula=["0"], fill=fill(RED_LIGHT), font=Font(color=RED, bold=True)))
    dash["B21"] = "Gifts total"
    dash["C21"] = "=SUM(C11:C20)"
    for c in "DEF":
        dash[f"{c}21"] = f"=SUM({c}11:{c}20)"
    style_range(dash, "B21:F21", bold=True)
    style_range(dash, "D21:F21", number_format=MONEY)
    bc = BarChart()
    bc.title = "Gift budget vs. spent by group"
    bc.height, bc.width = 8, 16
    bc.add_data(Reference(dash, min_col=4, max_col=5, min_row=10, max_row=16), titles_from_data=True)
    bc.set_categories(Reference(dash, min_col=2, min_row=11, max_row=16))
    dash.add_chart(bc, "H10")

    howto(wb, "Holiday Gift & Christmas Budget Planner", [
        "Open 'Setup': enter your total holiday budget and edit the gift groups.",
        "Open 'Gift List': add everyone you buy for, a gift idea and a budget. Fill in the actual cost and tick Bought / Wrapped as you shop.",
        "Open 'Other Costs': plan food, decorations, travel, cards and parties.",
        "Open 'Dashboard': see your plan vs. total budget, what you've spent and what's left, by group.",
    ])
    wb.active = 0
    wb.save(out / "Holiday-Gift-Budget-Planner.xlsx")


# ---------------------------------------------------------------- free

def free_budget(out):
    wb = Workbook()
    ws = wb.active
    ws.title = "One-Page Budget"
    title(ws, "One-Page Budget (50/30/20)", f"Free template from {BRAND} · penny-and-plan.pages.dev")
    for c, w in zip("BCDEFG", [26, 14, 4, 26, 14, 14]):
        ws.column_dimensions[c].width = w
    label_value(ws, 5, "Monthly take-home pay", 4000, MONEY, True)
    groups = [("NEEDS (target 50%)", ["Rent / mortgage", "Utilities", "Groceries", "Transport", "Insurance", "Minimum debt payments"], [1400, 180, 450, 220, 150, 100]),
              ("WANTS (target 30%)", ["Dining out", "Shopping", "Subscriptions", "Entertainment", "Travel"], [180, 120, 40, 90, 100]),
              ("SAVINGS & DEBT (target 20%)", ["Emergency fund", "Retirement", "Extra debt payments", "Goals"], [300, 200, 150, 120])]
    r = 7
    tot_rows = []
    for name, cats, amts in groups:
        header(ws, r, 2, [name, "Amount"])
        first = r + 1
        for i in range(8):
            ws.cell(row=first + i, column=2, value=cats[i] if i < len(cats) else None)
            ws.cell(row=first + i, column=3, value=amts[i] if i < len(amts) else None)
        style_range(ws, f"B{first}:C{first+7}", input_cell=True)
        style_range(ws, f"C{first}:C{first+7}", number_format=MONEY)
        ws.cell(row=first + 8, column=2, value="Total").font = Font(bold=True)
        ws.cell(row=first + 8, column=3, value=f"=SUM(C{first}:C{first+7})").number_format = MONEY
        tot_rows.append(first + 8)
        r = first + 10
    header(ws, 7, 5, ["Bucket", "Actual", "Target"])
    for i, (lbl, pct) in enumerate([("Needs", 0.5), ("Wants", 0.3), ("Savings & debt", 0.2)]):
        rr = 8 + i
        ws.cell(row=rr, column=5, value=lbl)
        ws.cell(row=rr, column=6, value=f"=IF($C$5=0,0,C{tot_rows[i]}/$C$5)").number_format = PCT
        ws.cell(row=rr, column=7, value=pct).number_format = PCT
    style_range(ws, "E8:G10")
    ws["E12"] = "Left over (unassigned)"
    ws["E12"].font = Font(bold=True)
    ws["F12"] = f"=C5-{'-'.join('C'+str(t) for t in tot_rows)}"
    ws["F12"].number_format = MONEY
    ws.conditional_formatting.add("F12", CellIsRule(operator="lessThan", formula=["0"], font=Font(color=RED, bold=True)))
    ws["E14"] = "Want a full monthly planner with a dashboard,"
    ws["E15"] = "transaction log and 12-month summary?"
    ws["E16"] = "penny-and-plan.pages.dev"
    ws["E16"].hyperlink = "https://penny-and-plan.pages.dev/p/budget-planner.html?utm_source=free-template"
    ws["E16"].font = Font(bold=True, color=ACCENT, underline="single")
    for c in ("E14", "E15"):
        ws[c].font = Font(color=MUTED)
    wb.save(out / "Free-One-Page-Budget.xlsx")


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    out.mkdir(parents=True, exist_ok=True)
    budget_planner(out)
    debt_payoff(out)
    business_tracker(out)
    savings_goals(out)
    holiday_budget(out)
    free_budget(out)
    print("spreadsheets written to", out)


if __name__ == "__main__":
    main()
