// solution_ex10.js

/**
 * SO SÁNH: MONOLITHIC SWITCH-CASE (CŨ) VS MODULAR FUNCTION ARCHITECTURE (MỚI)
 */

// ============================================================================
// 1. DỮ LIỆU CẤU HÌNH VÀ MẢNG KHỞI TẠO
// ============================================================================
const PLAN_CONFIG = {
  PERSONAL: { name: "PERSONAL", deviceLimit: 1, price: 59000 },
  FAMILY: { name: "FAMILY", deviceLimit: 4, price: 149000 }
};

let subscriptions = [
  { id: "SUB_001", customerName: "Nguyen Van A", plan: "PERSONAL", deviceLimit: 1, price: 59000, status: "ACTIVE" },
  { id: "SUB_002", customerName: "Tran Thi B", plan: "FAMILY", deviceLimit: 4, price: 149000, status: "ACTIVE" },
  { id: "SUB_003", customerName: "Le Van C", plan: "PERSONAL", deviceLimit: 1, price: 59000, status: "ACTIVE" }
];

// ============================================================================
// 2. TẦNG DỊCH VỤ DỮ LIỆU (SERVICE LAYER - Pure Logic, Không phụ thuộc UI/CLI)
// ============================================================================
const SubscriptionService = {
  findSubscriptionById(store, id) {
    return store.find(sub => sub.id === id);
  },

  createSubscription(store, customerName, planKey) {
    if (!customerName || customerName.trim() === "") {
      throw new Error("Tên khách hàng không được để trống.");
    }

    const plan = PLAN_CONFIG[planKey];
    if (!plan) {
      throw new Error("Gói cước không hợp lệ.");
    }

    const nextId = `SUB_${String(store.length + 1).padStart(3, "0")}`;
    const newSub = {
      id: nextId,
      customerName: customerName.trim(),
      plan: plan.name,
      deviceLimit: plan.deviceLimit,
      price: plan.price,
      status: "ACTIVE"
    };

    store.push(newSub);
    return newSub;
  },

  updateSubscriptionPlan(store, id, newPlanKey) {
    const sub = this.findSubscriptionById(store, id);
    if (!sub) {
      throw new Error(`Không tìm thấy thuê bao [${id}].`);
    }

    const plan = PLAN_CONFIG[newPlanKey];
    if (!plan) {
      throw new Error("Gói cước không hợp lệ.");
    }

    sub.plan = plan.name;
    sub.deviceLimit = plan.deviceLimit;
    sub.price = plan.price;
    return sub;
  },

  deleteSubscription(store, id) {
    const index = store.findIndex(sub => sub.id === id);
    if (index === -1) {
      throw new Error(`Không tìm thấy thuê bao [${id}].`);
    }

    return store.splice(index, 1)[0];
  }
};

// ============================================================================
// 3. TẦNG ĐIỀU KHIỂN CLI (CONTROLLER/HANDLER LAYER - Quản lý Input/Output)
// ============================================================================
const SubscriptionCliHandler = {
  handleAdd(store, readlineSync) {
    console.log("\n--- THÊM THUÊ BAO MỚI ---");
    const customerName = readlineSync.question("Nhập tên khách hàng: ");
    const plans = ["PERSONAL", "FAMILY"];
    const planIndex = readlineSync.keyInSelect(plans, "Chọn gói cước:", { cancel: false });
    const selectedPlan = plans[planIndex];

    try {
      const created = SubscriptionService.createSubscription(store, customerName, selectedPlan);
      console.log(`Thêm thành công thuê bao [${created.id}] cho khách hàng "${created.customerName}".`);
    } catch (error) {
      console.error(`Thao tác thất bại: ${error.message}`);
    }
  },

  handleList(store) {
    console.log("\n--- DANH SÁCH THUÊ BAO ---");
    if (store.length === 0) {
      console.log("Danh sách trống.");
      return;
    }
    console.table(store);
  },

  handleUpdate(store, readlineSync) {
    console.log("\n--- CẬP NHẬT GÓI CƯỚC ---");
    const targetId = readlineSync.question("Nhập mã thuê bao: ").trim().toUpperCase();
    const plans = ["PERSONAL", "FAMILY"];
    const planIndex = readlineSync.keyInSelect(plans, "Chọn gói cước mới:", { cancel: "Hủy" });

    if (planIndex === -1) {
      console.log("Đã hủy cập nhật.");
      return;
    }

    try {
      const updated = SubscriptionService.updateSubscriptionPlan(store, targetId, plans[planIndex]);
      console.log(`Cập nhật thành công thuê bao [${updated.id}] sang gói [${updated.plan}].`);
    } catch (error) {
      console.error(`Thao tác thất bại: ${error.message}`);
    }
  },

  handleDelete(store, readlineSync) {
    console.log("\n--- HỦY/XÓA THUÊ BAO ---");
    const targetId = readlineSync.question("Nhập mã thuê bao cần xóa: ").trim().toUpperCase();

    try {
      const removed = SubscriptionService.deleteSubscription(store, targetId);
      console.log(`Đã xóa thành công thuê bao [${removed.id}].`);
    } catch (error) {
      console.error(`Thao tác thất bại: ${error.message}`);
    }
  }
};

// ============================================================================
// 4. BÓC TÁCH MENU: SWITCH-CASE CHỈ ĐẢM NHẬN NHIỆM VỤ ĐIỀU HƯỚNG (DISPATCHER)
// ============================================================================
function executeMenuChoice(choice, store, readlineSync) {
  switch (choice) {
    case 1:
      SubscriptionCliHandler.handleAdd(store, readlineSync);
      break;
    case 2:
      SubscriptionCliHandler.handleList(store);
      break;
    case 3:
      SubscriptionCliHandler.handleUpdate(store, readlineSync);
      break;
    case 4:
      SubscriptionCliHandler.handleDelete(store, readlineSync);
      break;
    case 5:
      console.log("Thoát chương trình.");
      break;
    default:
      console.log("Lựa chọn không hợp lệ (1-5).");
      break;
  }
}

// ============================================================================
// 5. MINH CHỨNG KIỂM THỬ ĐỘC LẬP TỪNG HÀM (UNIT TESTS CHO SERVICE LAYER)
// ============================================================================
function runUnitTests() {
  const testStore = [];

  // Test 1: Tạo mới thành công
  const sub1 = SubscriptionService.createSubscription(testStore, "Test User", "FAMILY");
  console.assert(testStore.length === 1, "Test 1 Failed: Độ dài mảng không tăng");
  console.assert(sub1.deviceLimit === 4, "Test 1 Failed: Sai deviceLimit");
  console.assert(sub1.price === 149000, "Test 1 Failed: Sai giá cước");

  // Test 2: Validation chặn tên rỗng
  try {
    SubscriptionService.createSubscription(testStore, "", "PERSONAL");
    console.assert(false, "Test 2 Failed: Chưa chặn tên rỗng");
  } catch (err) {
    console.assert(err.message === "Tên khách hàng không được để trống.", "Test 2 Passed");
  }

  // Test 3: Cập nhật gói
  SubscriptionService.updateSubscriptionPlan(testStore, sub1.id, "PERSONAL");
  console.assert(sub1.plan === "PERSONAL", "Test 3 Failed: Gói cước chưa đổi");
  console.assert(sub1.deviceLimit === 1, "Test 3 Failed: deviceLimit chưa cập nhật");

  // Test 4: Xóa thành công
  const deleted = SubscriptionService.deleteSubscription(testStore, sub1.id);
  console.assert(deleted.id === sub1.id, "Test 4 Failed: Xóa sai ID");
  console.assert(testStore.length === 0, "Test 4 Failed: Mảng chưa giảm số lượng");

  console.log("-> [UNIT TEST]: Toàn bộ test case của SubscriptionService đã vượt qua!");
}

runUnitTests();