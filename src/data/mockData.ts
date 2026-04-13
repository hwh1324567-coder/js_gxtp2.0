import { GraphData } from '../types';

export const mockData: GraphData = {
  nodes: [
    // 核心案件 (Level 0)
    { id: 'C1', label: '11.02特大走私案', type: 'Case', details: '涉案金额1000万', date: '2023-11-02' },
    
    // 核心嫌疑人及关键地点 (Level 1)
    { id: 'P1', label: '张三', type: 'Person', details: '涉嫌倒卖大户', date: '2023-05-10' },
    { id: 'P5', label: '王强', type: 'Person', details: '二号头目', date: '2023-06-15' },
    { id: 'S1', label: '鑫源烟酒行', type: 'Shop', details: '专卖证号: 12345678', date: '2022-01-01' },
    { id: 'S2', label: '城郊隐蔽仓库', type: 'Shop', details: '未登记仓储点', date: '2023-05-01' },
    { id: 'E2', label: '包裹 ZT88899922', type: 'Express', details: '发往外省的涉案包裹' },
    
    // 关联人员、车辆及通讯 (Level 2)
    { id: 'P2', label: '李四', type: 'Person', details: '零售户' },
    { id: 'P6', label: '刘伟', type: 'Person', details: '仓库管理员' },
    { id: 'P7', label: '陈浩', type: 'Person', details: '物流内鬼' },
    { id: 'S3', label: '老街便利店', type: 'Shop', details: '分销点' },
    { id: 'V1', label: '粤B·12345', type: 'Vehicle', details: '厢式货车' },
    { id: 'V3', label: '粤B·99999', type: 'Vehicle', details: '套牌金杯车' },
    
    // 外围人员、资金、通讯及物流 (Level 3)
    { id: 'P3', label: '王五', type: 'Person', details: '资金提供者' },
    { id: 'P4', label: '赵六', type: 'Person', details: '司机' },
    { id: 'P8', label: '林涛', type: 'Person', details: '下线分销商' },
    { id: 'E1', label: '包裹 SF10029384', type: 'Express', details: '内含中华香烟50条' },
    { id: 'E3', label: '闪送订单 SS20231102', type: 'Express', details: '同城转移赃物' },
    { id: 'S4', label: '废弃印刷厂', type: 'Shop', details: '假证制造窝点' },
    
    // 边缘节点 (Level 4+)
    { id: 'P9', label: '吴明', type: 'Person', details: '制假证人员' },
    { id: 'P10', label: '周杰', type: 'Person', details: '跑腿小哥' },
    { id: 'V2', label: '粤A·88888', type: 'Vehicle', details: '套牌车辆' },
    { id: 'V4', label: '无牌电动三轮', type: 'Vehicle', details: '末端配送车' },
  ],
  links: [
    // 核心案件关联
    { id: 'L_P1_C1', source: 'P1', target: 'C1', type: '主犯' },
    { id: 'L_P5_C1', source: 'P5', target: 'C1', type: '从犯' },
    { id: 'L_S1_C1', source: 'S1', target: 'C1', type: '涉案门店' },
    { id: 'L_S2_C1', source: 'S2', target: 'C1', type: '查获地' },
    { id: 'L_E2_C1', source: 'E2', target: 'C1', type: '涉案包裹' },

    // 一层与二层关联
    { id: 'L_P1_S2', source: 'P1', target: 'S2', type: '租赁', date: '2023-05-01' },
    { id: 'L_P1_P5', source: 'P1', target: 'P5', type: '同伙' },
    { id: 'L_P5_S3', source: 'P5', target: 'S3', type: '幕后老板' },
    { id: 'L_P2_S1', source: 'P2', target: 'S1', type: '法人' },
    { id: 'L_P6_S2', source: 'P6', target: 'S2', type: '管理' },
    { id: 'L_P7_E2', source: 'P7', target: 'E2', type: '违规揽收' },
    { id: 'L_V1_S2', source: 'V1', target: 'S2', type: '频繁出入' },
    { id: 'L_V3_E2', source: 'V3', target: 'E2', type: '运输包裹' },
    { id: 'L_V3_S2', source: 'V3', target: 'S2', type: '夜间装货' },
    { id: 'L_S1_S3', source: 'S1', target: 'S3', type: '调货' },

    // 二层与三层关联
    { id: 'L_P3_P5', source: 'P3', target: 'P5', type: '资金往来', amount: 200000 },
    { id: 'L_P4_V1', source: 'P4', target: 'V1', type: '驾驶' },
    { id: 'L_E1_V1', source: 'E1', target: 'V1', type: '装载' },
    { id: 'L_P8_S3', source: 'P8', target: 'S3', type: '进货' },
    { id: 'L_V4_E3', source: 'V4', target: 'E3', type: '配送包裹' },
    { id: 'L_S4_V2', source: 'S4', target: 'V2', type: '提供套牌' },

    // 三层与边缘节点关联
    { id: 'L_P8_V4', source: 'P8', target: 'V4', type: '使用' },
    { id: 'L_P10_E3', source: 'P10', target: 'E3', type: '派送' },
    { id: 'L_P10_P8', source: 'P10', target: 'P8', type: '送货' },
    { id: 'L_P9_S4', source: 'P9', target: 'S4', type: '经营' },
    { id: 'L_P4_V2', source: 'P4', target: 'V2', type: '曾驾驶' },
    { id: 'L_P1_P2', source: 'P1', target: 'P2', type: '资金往来', amount: 50000 },
  ],
};
