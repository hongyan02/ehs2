import { getLockInventory, getLockTypeOptions, getDepartmentOptions, updateInventoryStatus } from "./services";

export async function getLockInventoryController(c: any) {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const pageSize = parseInt(c.req.query("pageSize") || "10");
    const lockType = c.req.query("lockType") || undefined;
    const department = c.req.query("department") || undefined;
    const holderName = c.req.query("holderName") || undefined;
    const lockNumber = c.req.query("lockNumber") || undefined;

    const result = await getLockInventory({
      page,
      pageSize,
      lockType,
      department,
      holderName,
      lockNumber,
    });

    return c.json(result);
  } catch (error) {
    console.error("Error getting lock inventory:", error);
    return c.json({ error: "获取锁具库存失败" }, { status: 500 });
  }
}

export async function getLockTypeOptionsController(c: any) {
  try {
    const types = await getLockTypeOptions();
    return c.json({ data: types });
  } catch (error) {
    console.error("Error getting lock type options:", error);
    return c.json({ error: "获取锁具类型选项失败" }, { status: 500 });
  }
}

export async function getDepartmentOptionsController(c: any) {
  try {
    const departments = await getDepartmentOptions();
    return c.json({ data: departments });
  } catch (error) {
    console.error("Error getting department options:", error);
    return c.json({ error: "获取部门选项失败" }, { status: 500 });
  }
}

export async function updateInventoryStatusController(c: any) {
  try {
    const body = await c.req.json();
    const { lockNumber, status } = body;

    if (!lockNumber || !status) {
      return c.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const result = await updateInventoryStatus(lockNumber, status);
    return c.json(result);
  } catch (error) {
    console.error("Error updating inventory status:", error);
    return c.json({ error: "更新库存状态失败" }, { status: 500 });
  }
}
