const TICKET_ALLOWANCE = {
    ECONOMY: 20,
    BUSINESS: 30
};

const FREQUENT_FLYER_BONUS = {
    TITAN: 10,
    GOLD: 10,
    PLATINUM: 10
};

const SPECIAL_FEES = {
    BULKY: 200000,
    PET: 500000
};

const RATE_TIER_1 = 60000;
const RATE_TIER_2 = 80000;

function formatVND(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function calculateBaggageSurcharge(ticket, baggageList) {
    const baseAllowance = TICKET_ALLOWANCE[ticket.ticketClass] || 0;
    const membershipBonus = FREQUENT_FLYER_BONUS[ticket.memberTier] || 0;
    const totalAllowance = baseAllowance + membershipBonus;

    let totalWeight = 0;
    let bulkyCount = 0;
    let petCount = 0;

    for (const item of baggageList) {
        totalWeight += item.weight;
        if (item.type === "BULKY") {
            bulkyCount++;
        } else if (item.type === "PET") {
            petCount++;
        }
    }

    const excessWeight = Math.max(0, totalWeight - totalAllowance);
    let weightFee = 0;

    if (excessWeight > 0) {
        if (excessWeight <= 5) {
            weightFee = excessWeight * RATE_TIER_1;
        } else {
            weightFee = (5 * RATE_TIER_1) + ((excessWeight - 5) * RATE_TIER_2);
        }
    }

    const bulkyFee = bulkyCount * SPECIAL_FEES.BULKY;
    const petFee = petCount * SPECIAL_FEES.PET;
    const totalSurcharge = weightFee + bulkyFee + petFee;

    return {
        baseAllowance,
        membershipBonus,
        totalAllowance,
        totalWeight,
        excessWeight,
        weightFee,
        bulkyCount,
        bulkyFee,
        petCount,
        petFee,
        totalSurcharge
    };
}

function printBaggageReceipt(ticket, baggageList, billing) {
    const width = 64;
    const divider = "=".repeat(width);
    const line = "-".repeat(width);

    console.log(divider);
    console.log("            BIÊN LAI THU CƯỚC HÀNH LÝ SÂN BAY                   ");
    console.log("               BAGGAGE SURCHARGE RECEIPT                        ");
    console.log(divider);
    console.log(` Hành khách (Passenger) : ${ticket.passengerName}`);
    console.log(` Mã đặt chỗ (PNR)       : ${ticket.pnr.padEnd(10)} Chuyến bay: ${ticket.flightNumber}`);
    console.log(` Hạng vé (Class)        : ${ticket.ticketClass.padEnd(10)} Hội viên  : ${ticket.memberTier || "STANDARD"}`);
    console.log(line);
    console.log(" CHI TIẾT KIỆN HÀNG KÝ GỬI:");
    console.log(` ${"STT".padEnd(5)}${"Mã kiện".padEnd(14)}${"Loại kiện".padEnd(20)}${"Khối lượng".padStart(12)}`);

    baggageList.forEach((item, index) => {
        const idx = (index + 1).toString().padEnd(5);
        const code = item.tagCode.padEnd(14);
        const type = item.type.padEnd(20);
        const weight = `${item.weight} kg`.padStart(12);
        console.log(` ${idx}${code}${type}${weight}`);
    });

    console.log(line);
    console.log(` Tổng khối lượng thực tế : ${`${billing.totalWeight} kg`.padStart(35)}`);
    console.log(` Hạn mức miễn cước gốc   : ${`${billing.baseAllowance} kg`.padStart(35)}`);
    console.log(` Miễn cước ưu đãi hội viên: ${`${billing.membershipBonus} kg`.padStart(34)}`);
    console.log(` Khối lượng vượt hạn mức : ${`${billing.excessWeight} kg`.padStart(35)}`);
    console.log(line);
    console.log(" TỔNG HỢP CÁC KHOẢN PHỤ PHÍ:");
    console.log(` - Cước quá cân          : ${formatVND(billing.weightFee).padStart(35)}`);
    console.log(` - Phí cồng kềnh (${billing.bulkyCount} kiện) : ${formatVND(billing.bulkyFee).padStart(35)}`);
    console.log(` - Phí thú cưng  (${billing.petCount} lồng) : ${formatVND(billing.petFee).padStart(35)}`);
    console.log(divider);
    console.log(` TỔNG TIỀN PHẢI THANH TOÁN: ${formatVND(billing.totalSurcharge).padStart(33)}`);
    console.log(divider);
    console.log(" Quý khách vui lòng giữ biên lai để nhận hành lý tại điểm đến.");
    console.log(divider + "\n");
}

function processBaggageCheckIn(ticket, baggageList) {
    const billing = calculateBaggageSurcharge(ticket, baggageList);
    printBaggageReceipt(ticket, baggageList, billing);
    return billing;
}

const sampleTicket1 = {
    pnr: "VN501",
    passengerName: "VU HOANG DUONG",
    flightNumber: "VN216",
    ticketClass: "ECONOMY",
    memberTier: "TITAN"
};

const sampleBaggageList1 = [
    { tagCode: "TAG-001", weight: 22, type: "STANDARD" },
    { tagCode: "TAG-002", weight: 15, type: "BULKY" },
    { tagCode: "TAG-003", weight: 8, type: "PET" }
];

const sampleTicket2 = {
    pnr: "VN502",
    passengerName: "DO THI BICH",
    flightNumber: "VN216",
    ticketClass: "BUSINESS",
    memberTier: "STANDARD"
};

const sampleBaggageList2 = [
    { tagCode: "TAG-004", weight: 25, type: "STANDARD" },
    { tagCode: "TAG-005", weight: 12, type: "STANDARD" }
];

processBaggageCheckIn(sampleTicket1, sampleBaggageList1);
processBaggageCheckIn(sampleTicket2, sampleBaggageList2);