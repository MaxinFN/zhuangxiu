import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useContentStore } from './contentStore'

const STORAGE_KEY = 'reno_materials'

// 各阶段材料清单（简化版，后续可从MD扩展）
const DEFAULT_MATERIALS = {
  preparation: [
    { id: 'mat-prep-1', text: '激光测距仪', price: '¥80-300', note: '精确测量房屋尺寸' },
    { id: 'mat-prep-2', text: '户型图打印', price: '¥0-50', note: '可用酷家乐等免费软件' },
    { id: 'mat-prep-3', text: '装修许可证押金', price: '¥500-3000', note: '物业收取，验收后退还' },
    { id: 'mat-prep-4', text: '装修设计费', price: '¥50-300/㎡', note: '独立设计师收费' },
  ],
  demolition: [
    { id: 'mat-dem-1', text: '垃圾清运费', price: '¥500-2000', note: '按面积或车次计算' },
    { id: 'mat-dem-2', text: '新砌墙体材料', price: '视面积', note: '轻质砖/红砖+水泥砂浆' },
    { id: 'mat-dem-3', text: '门窗保护膜', price: '¥50-100', note: '施工期间保护成品' },
  ],
  'plumbing-electric': [
    { id: 'mat-pe-1', text: '电线（2.5/4/6平方）', price: '¥2-8/米', note: '品牌：熊猫、德力西、正泰' },
    { id: 'mat-pe-2', text: '线管+底盒', price: '¥2-5/米', note: 'PVC阻燃管' },
    { id: 'mat-pe-3', text: '水管（PPR）', price: '¥15-30/米', note: '品牌：伟星、日丰、金牛' },
    { id: 'mat-pe-4', text: '强弱电箱', price: '¥100-500', note: '根据回路数量选择' },
    { id: 'mat-pe-5', text: '开关插座面板', price: '¥10-50/个', note: '提前统计数量' },
    { id: 'mat-pe-6', text: '网线（六类）', price: '¥3-5/米', note: '每个房间预留网口' },
  ],
  tiling: [
    { id: 'mat-til-1', text: '瓷砖（地砖+墙砖）', price: '¥50-300/㎡', note: '品牌：马可波罗、东鹏、诺贝尔' },
    { id: 'mat-til-2', text: '防水涂料', price: '¥40-80/㎡', note: '品牌：雨虹、德高、西卡' },
    { id: 'mat-til-3', text: '水泥+黄沙', price: '¥30-50/㎡', note: '半包由施工方提供' },
    { id: 'mat-til-4', text: '美缝剂', price: '¥5-15/米', note: '品牌：皇氏工匠、卓高' },
    { id: 'mat-til-5', text: '地漏', price: '¥50-200/个', note: '品牌：潜水艇、九牧' },
  ],
  woodwork: [
    { id: 'mat-woo-1', text: '石膏板', price: '¥30-80/张', note: '品牌：龙牌、泰山' },
    { id: 'mat-woo-2', text: '轻钢龙骨', price: '¥8-15/米', note: '吊顶用' },
    { id: 'mat-woo-3', text: '生态板/多层板', price: '¥150-300/张', note: '柜体用，注意环保等级E0/E1' },
    { id: 'mat-woo-4', text: '五金件', price: '¥5-50/个', note: '合页、滑轨、拉手' },
  ],
  painting: [
    { id: 'mat-pai-1', text: '腻子粉', price: '¥20-40/袋', note: '品牌：美巢、立邦' },
    { id: 'mat-pai-2', text: '墙固/界面剂', price: '¥50-100/桶', note: '增强腻子附着力' },
    { id: 'mat-pai-3', text: '乳胶漆', price: '¥200-800/桶', note: '品牌：立邦、多乐士、三棵树' },
    { id: 'mat-pai-4', text: '壁纸/壁布', price: '¥50-200/㎡', note: '按需选择' },
  ],
  installation: [
    { id: 'mat-ins-1', text: '橱柜', price: '¥800-3000/延米', note: '定制周期约30-45天' },
    { id: 'mat-ins-2', text: '室内门', price: '¥800-3000/樘', note: '含门套+五金+安装' },
    { id: 'mat-ins-3', text: '马桶', price: '¥500-3000', note: '品牌：TOTO、科勒、箭牌' },
    { id: 'mat-ins-4', text: '浴室柜+镜柜', price: '¥800-3000', note: '注意防水防潮' },
    { id: 'mat-ins-5', text: '花洒', price: '¥200-1500', note: '品牌：九牧、恒洁、汉斯格雅' },
    { id: 'mat-ins-6', text: '烟机灶具', price: '¥2000-6000', note: '品牌：方太、老板、华帝' },
    { id: 'mat-ins-7', text: '热水器', price: '¥1000-4000', note: '燃气/电热按需选择' },
  ],
  'soft-furnishing': [
    { id: 'mat-soft-1', text: '沙发', price: '¥2000-8000', note: '材质：布艺/皮艺/科技布' },
    { id: 'mat-soft-2', text: '床+床垫', price: '¥2000-8000', note: '主卧+次卧分别采购' },
    { id: 'mat-soft-3', text: '餐桌椅', price: '¥1000-4000', note: '尺寸根据餐厅面积确定' },
    { id: 'mat-soft-4', text: '窗帘', price: '¥50-200/米', note: '含轨道/罗马杆' },
    { id: 'mat-soft-5', text: '灯具', price: '¥100-1000/盏', note: '主灯+辅灯+氛围灯' },
    { id: 'mat-soft-6', text: '家电（冰箱/洗衣机/电视）', price: '¥5000-20000', note: '提前确定尺寸预留位置' },
  ],
  completion: [
    { id: 'mat-com-1', text: '甲醛检测', price: '¥200-500', note: '入住前必做' },
    { id: 'mat-com-2', text: '开荒保洁', price: '¥500-1500', note: '装修后深度清洁' },
    { id: 'mat-com-3', text: '绿植/活性炭', price: '¥100-500', note: '辅助净化空气' },
  ],
}

export const useMaterialStore = defineStore('material', () => {
  const checkedMap = ref(loadChecked())

  const contentStore = useContentStore()

  function getMaterials(stageId) {
    return DEFAULT_MATERIALS[stageId] || []
  }

  function isChecked(materialId) {
    return !!checkedMap.value[materialId]
  }

  function toggle(materialId) {
    checkedMap.value[materialId] = !checkedMap.value[materialId]
    if (!checkedMap.value[materialId]) {
      delete checkedMap.value[materialId]
    }
    save()
  }

  function getStageProgress(stageId) {
    const items = getMaterials(stageId)
    if (!items.length) return 0
    const done = items.filter(i => isChecked(i.id)).length
    return Math.round((done / items.length) * 100)
  }

  function loadChecked() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap.value))
  }

  return {
    getMaterials,
    isChecked,
    toggle,
    getStageProgress,
  }
})
