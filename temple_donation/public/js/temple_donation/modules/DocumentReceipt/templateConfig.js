export const sampleData = {
    temple_name: "Sri Venkateswara Swamy Temple",
    trust_name: "Tirumala Tirupati Devasthanams",
    address: "Tirumala Hill",
    city: "Tirupati",
    state: "Andhra Pradesh",
    country: "India",
    phone: "+91 98765 43210",
    email: "contact@templetrust.org",
    website: "www.templetrust.org",
    receipt_number: "DON-2026-0048",
    receipt_date: "02 Jul 2026",
    created_by: "admin@temple.org",
    cashier: "Shailesh Kumar",
    donor_name: "Rajesh Kumar Sharma",
    mobile: "9876543210",
    donation_type: "Special Abhishekam Prasadam",
    amount: "1008.00",
    payment_mode: "UPI / PhonePe",
    notes: "Special prayers for health and prosperity",
    guest_name: "Rajesh Kumar Sharma",
    room_number: "A-102",
    room_type: "AC Double Suite",
    building: "Nandanam Guest House",
    check_in: "02-07-2026 10:00 AM",
    check_out: "04-07-2026 12:00 PM",
    days: "2 Days",
    entry_number: "STK-IN-2026-0012",
    entry_type: "Stock In",
    item_name: "Pure Cow Ghee",
    quantity: "25",
    unit: "Kilograms",
    rate: "650.00",
    total: "16250.00",
    reference: "PO-GHEE-921",
    voucher_number: "EXP-2026-0104",
    paid_to: "Ramesh Patel",
    expense_type: "Electricity Bill Payment",
    pass_number: "PASS-2026-0921",
    visitor_name: "Amit Verma",
    visitor_mobile: "9876543210",
    purpose: "Meeting with Temple Trustee",
    valid_until: "16-07-2026 06:00 PM",
    pan_number: "ABCDE1234F",
    certificate_number: "CERT-2026-0048",
    qr_code: `<div style="border: 2px dashed #a1a1aa; width: 100px; height: 100px; padding: 5px; margin: 10px auto; background:#f4f4f5; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a;">SAMPLE QR</div>`,
    logo_tag: `<div style="border: 1px dashed #a1a1aa; width: 70px; height: 70px; background:#e4e4e7; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a; border-radius:4px;">LOGO</div>`
};

export const variablesList = [
    { name: "{{temple_name}}", desc: "Name of the Temple", cat: "Temple" },
    { name: "{{trust_name}}", desc: "Name of the Trust", cat: "Temple" },
    { name: "{{address}}", desc: "Temple Address", cat: "Temple" },
    { name: "{{city}}", desc: "Temple City", cat: "Temple" },
    { name: "{{state}}", desc: "Temple State", cat: "Temple" },
    { name: "{{phone}}", desc: "Contact Number", cat: "Temple" },
    { name: "{{email}}", desc: "Email Address", cat: "Temple" },
    { name: "{{website}}", desc: "Website URL", cat: "Temple" },
    { name: "{{receipt_number}}", desc: "Unique Receipt ID", cat: "Common" },
    { name: "{{receipt_date}}", desc: "Posting/Creation Date", cat: "Common" },
    { name: "{{cashier}}", desc: "Cashier Name", cat: "Common" },
    { name: "{{qr_code}}", desc: "QR Code verification image tag", cat: "Common" },
    { name: "{{donor_name}}", desc: "Donor Name", cat: "Donation" },
    { name: "{{mobile}}", desc: "Donor Contact No", cat: "Donation" },
    { name: "{{donation_type}}", desc: "Donation category/items", cat: "Donation" },
    { name: "{{amount}}", desc: "Receipt Amount (numeric)", cat: "Donation / Room" },
    { name: "{{payment_mode}}", desc: "Mode of Payment", cat: "Donation / Room" },
    { name: "{{guest_name}}", desc: "Room Guest Name", cat: "Room" },
    { name: "{{room_number}}", desc: "Assigned Room Number", cat: "Room" },
    { name: "{{room_type}}", desc: "Room Category", cat: "Room" },
    { name: "{{building}}", desc: "Guest House Building", cat: "Room" },
    { name: "{{check_in}}", desc: "Check-in Date & Time", cat: "Room" },
    { name: "{{check_out}}", desc: "Check-out Date & Time", cat: "Room" },
    { name: "{{days}}", desc: "Total Number of Days", cat: "Room" },
    { name: "{{entry_number}}", desc: "Stock Entry Doc ID", cat: "Inventory" },
    { name: "{{entry_type}}", desc: "Stock In/Out/Adjustment", cat: "Inventory" },
    { name: "{{item_name}}", desc: "First item name", cat: "Inventory" },
    { name: "{{quantity}}", desc: "Total quantity of entry", cat: "Inventory" },
    { name: "{{unit}}", desc: "Unit of measurement", cat: "Inventory" },
    { name: "{{rate}}", desc: "Valuation/Rate per unit", cat: "Inventory" },
    { name: "{{total}}", desc: "Inventory Entry Value", cat: "Inventory" },
    { name: "{{reference}}", desc: "Purchase order/invoice reference", cat: "Inventory" },
    { name: "{{voucher_number}}", desc: "Expense Voucher ID", cat: "Expense" },
    { name: "{{paid_to}}", desc: "Recipient of the Expense payment", cat: "Expense" },
    { name: "{{expense_type}}", desc: "Category/Description of Expense", cat: "Expense" },
    { name: "{{pass_number}}", desc: "Visitor Pass ID", cat: "Visitor Pass" },
    { name: "{{visitor_name}}", desc: "Name of the Visitor", cat: "Visitor Pass" },
    { name: "{{visitor_mobile}}", desc: "Visitor Phone No", cat: "Visitor Pass" },
    { name: "{{purpose}}", desc: "Purpose of the visit", cat: "Visitor Pass" },
    { name: "{{valid_until}}", desc: "Pass Expiration Time", cat: "Visitor Pass" },
    { name: "{{pan_number}}", desc: "PAN card number of donor for tax exception", cat: "Certificate" },
    { name: "{{certificate_number}}", desc: "Unique Certificate ID", cat: "Certificate" }
];

const defaultHeader = `<div style="display: flex; align-items: center; border-bottom: 2px solid {{primary_color}}; padding-bottom: 12px; margin-bottom: 15px;">
    {% if logo_tag %}
    <div style="flex-shrink: 0; margin-right: 18px;">
        {{logo_tag}}
    </div>
    {% endif %}
    <div style="flex-grow: 1;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: {{primary_color}}; line-height: 1.2;">{{temple_name}}</h1>
        {% if trust_name and trust_name != temple_name %}
        <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 600; color: {{secondary_color}}; text-transform: uppercase; letter-spacing: 0.5px;">{{trust_name}}</p>
        {% endif %}
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #4b5563; line-height: 1.4;">{{address}}, {{city}}, {{state}}</p>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Phone: {{phone}} | Email: {{email}}</p>
    </div>
</div>`;

const defaultFooter = `<div style="text-align: center; font-size: 11px; color: {{secondary_color}}; padding-top: 8px;">
    <p style="margin: 0; font-style: italic; font-weight: 500;">
        "May the blessings of the Almighty bring health, prosperity, and peace to your family."
    </p>
    <p style="margin: 4px 0 0 0; font-size: 9px; color: #9ca3af;">
        This is a computer-generated document and does not require a physical signature.
    </p>
</div>`;

export const presets = {
    donation: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">DONATION RECEIPT</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{receipt_number}}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tbody>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 30%;">Date:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{receipt_date}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Received From:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: {{primary_color}};">{{donor_name}} {% if mobile %}(+91 {{mobile}}){% endif %}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Towards Purpose:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{donation_type}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Payment Mode:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{payment_mode}}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb; border-bottom: 2px solid {{primary_color}};">
                <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: {{primary_color}};">Total Amount:</td>
                <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: {{primary_color}};">₹{{amount}}</td>
            </tr>
        </tbody>
    </table>

    {% if notes %}
    <div style="margin-top: 12px; padding: 8px; background-color: #f9fafb; border-left: 3px solid {{secondary_color}}; font-size: 12px; font-style: italic; color: #4b5563;">
        Note: {{notes}}
    </div>
    {% endif %}
</div>`,
        footer: defaultFooter
    },
    room: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">ROOM BOOKING RECEIPT</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{receipt_number}}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tbody>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 30%;">Guest Name:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1f2937;">{{guest_name}}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Guest House / Bldg:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{building}}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Room Info:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">Room No. {{room_number}} ({{room_type}})</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Duration:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{check_in}} to {{check_out}} ({{days}})</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">Payment Mode:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{payment_mode}}</td>
            </tr>
            <tr style="border-top: 1.5px solid #e5e7eb; border-bottom: 2px solid {{primary_color}};">
                <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: {{primary_color}};">Paid Amount:</td>
                <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: {{primary_color}};">₹{{amount}}</td>
            </tr>
        </tbody>
    </table>

    {% if notes %}
    <div style="margin-top: 12px; padding: 8px; background-color: #f9fafb; border-left: 3px solid {{secondary_color}}; font-size: 12px; font-style: italic; color: #4b5563;">
        Remarks: {{notes}}
    </div>
    {% endif %}
</div>`,
        footer: defaultFooter
    },
    inventory: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">STOCK MOVEMENT VOUCHER</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{entry_number}}</span>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: #4b5563;">
        <div><strong>Type:</strong> {{entry_type}}</div>
        <div><strong>Date:</strong> {{receipt_date}}</div>
        {% if reference %}<div><strong>Ref No:</strong> {{reference}}</div>{% endif %}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <thead>
            <tr style="border-bottom: 2px solid {{primary_color}}; border-top: 1px solid #e5e7eb;">
                <th style="padding: 8px 4px; text-align: left; background: none; color: #1f2937; font-weight: 700;">Item Name</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Qty</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Rate</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">{{item_name}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">{{quantity}} {{unit}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">₹{{rate}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #1f2937;">₹{{total}}</td>
            </tr>
            <tr style="border-top: 1.5px solid #e5e7eb; border-bottom: 2px solid {{primary_color}}; font-weight: 700;">
                <td colspan="3" style="padding: 10px 4px; color: {{primary_color}};">Grand Total:</td>
                <td style="padding: 10px 4px; text-align: right; color: {{primary_color}}; font-size: 14px; font-weight: 800;">₹{{total}}</td>
            </tr>
        </tbody>
    </table>

    {% if notes %}
    <div style="margin-top: 15px; padding: 8px; background-color: #f9fafb; border-left: 3px solid {{secondary_color}}; font-size: 12px; font-style: italic; color: #4b5563;">
        Remarks: {{notes}}
    </div>
    {% endif %}
</div>`,
        footer: defaultFooter
    },
    expense: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">EXPENSE VOUCHER</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{voucher_number}}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tbody>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 30%;">Date:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{receipt_date}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Paid To:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: {{primary_color}};">{{paid_to}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Expense Type:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{expense_type}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Payment Mode:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{payment_mode}}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb; border-bottom: 2px solid {{primary_color}};">
                <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: {{primary_color}};">Total Paid:</td>
                <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: {{primary_color}};">₹{{amount}}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: center; width: 120px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 11px;">
            Prepared By: {{cashier}}
        </div>
        <div style="text-align: center; width: 120px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 11px;">
            Approved By
        </div>
        <div style="text-align: center; width: 120px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 11px;">
            Receiver Sign
        </div>
    </div>
</div>`,
        footer: defaultFooter
    },
    purchase: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">PURCHASE RECEIPT</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{entry_number}}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <tbody>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 30%;">Supplier:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{reference}}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Date:</td>
                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{receipt_date}}</td>
            </tr>
        </tbody>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <thead>
            <tr style="border-bottom: 2px solid {{primary_color}}; border-top: 1px solid #e5e7eb;">
                <th style="padding: 8px 4px; text-align: left; background: none; color: #1f2937; font-weight: 700;">Item Description</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Qty</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Rate</th>
                <th style="padding: 8px 4px; text-align: right; background: none; color: #1f2937; font-weight: 700; width: 25%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">{{item_name}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">{{quantity}} {{unit}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">₹{{rate}}</td>
                <td style="padding: 10px 4px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #1f2937;">₹{{total}}</td>
            </tr>
            <tr style="border-top: 1.5px solid #e5e7eb; border-bottom: 2px solid {{primary_color}}; font-weight: 700;">
                <td colspan="3" style="padding: 10px 4px; color: {{primary_color}};">Grand Total:</td>
                <td style="padding: 10px 4px; text-align: right; color: {{primary_color}}; font-size: 14px; font-weight: 800;">₹{{total}}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
            {{qr_code}}
        </div>
        <div style="text-align: center; width: 150px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 12px;">
            Store Manager
        </div>
    </div>
</div>`,
        footer: defaultFooter
    },
    visitor: {
        header: defaultHeader,
        body: `<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: {{primary_color}};">VISITOR ENTRY PASS</span>
        <span style="font-weight: 700; font-size: 14px; color: #1f2937;">No: {{pass_number}}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tbody>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 30%;">Visitor Name:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #1f2937;">{{visitor_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Mobile Number:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">+91 {{visitor_mobile}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Purpose:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1f2937;">{{purpose}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Valid Until:</td>
                <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #ef4444;">{{valid_until}}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 25px; display: flex; justify-content: center;">
        {{qr_code}}
    </div>
</div>`,
        footer: `<div style="text-align: center; font-size: 11px; color: {{secondary_color}}; padding-top: 8px;">
    <p style="margin: 0; font-weight: 600; color: #ef4444;">
        * Please wear this pass prominently at all times during your visit.
    </p>
    <p style="margin: 4px 0 0 0; font-size: 9px; color: #9ca3af;">
        Return this pass to the gate security at check-out.
    </p>
</div>`
    },
    certificate: {
        header: defaultHeader,
        body: `<div style="margin-top: 20px; border: 2px double {{primary_color}}; padding: 25px; border-radius: 8px; background-color: #fffaf0;">
    <div style="text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: {{primary_color}}; letter-spacing: 1px;">DONATION APPRECIATION CERTIFICATE</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Certificate No: {{certificate_number}}</p>
    </div>

    <div style="margin-top: 25px; text-align: justify; font-size: 14px; line-height: 1.8; color: #374151;">
        We gratefully acknowledge and extend our heartfelt appreciation to 
        <strong>{{donor_name}}</strong> {% if pan_number %}(PAN: {{pan_number}}){% endif %} 
        for their generous donation of <strong>₹{{amount}}</strong> 
        (Rupees One Thousand and Eight Only) made on <strong>{{receipt_date}}</strong>.
    </div>

    <div style="margin-top: 15px; font-size: 13px; color: #4b5563; text-align: justify;">
        Your noble contribution towards <strong>{{donation_type}}</strong> is highly valued and will be utilized for the welfare activities and maintenance of the temple trust.
    </div>

    <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
            {{qr_code}}
        </div>
        <div style="text-align: center; width: 180px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 12px; font-weight: 600; color: #1f2937;">
            Trust President / Secretary
        </div>
    </div>
</div>`,
        footer: defaultFooter
    }
};
