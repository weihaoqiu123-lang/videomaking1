export interface ProductRecord {
  sku: string;
  name: string;
  category: string;
  image: string;
  link: string;
}

export const PRODUCT_CATALOG: ProductRecord[] = [
  {
    sku: 'HUAWEI123',
    name: 'Huawei Outdoor Smart Canopy',
    category: '户外家具 / 遮阳篷',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/HUAWEI123',
  },
  {
    sku: 'TP10241PI',
    name: '电子炉灶厨房玩具套装',
    category: '儿童玩具 / 模拟厨房',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/TP10241PI',
  },
  {
    sku: 'SP38244US',
    name: '城市折叠越野电动自行车',
    category: '运动户外 / 电动出行',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/SP38244US',
  },
  {
    sku: 'TA10065BK',
    name: '30L双层可视不锈钢空气炸锅',
    category: '厨房家电 / 智能料理',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/TA10065BK',
  },
  {
    sku: 'NP13982BE',
    name: '双门小天窗户外速开充气帐篷',
    category: '露营装备 / 帐篷',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/NP13982BE',
  },
  {
    sku: 'HD99011SL',
    name: '人体工学网眼可调电竞椅',
    category: '办公家具 / 电脑椅',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
    link: 'https://erp.example.com/products/HD99011SL',
  },
];

export const searchProducts = (query: string): ProductRecord[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return PRODUCT_CATALOG.filter((product) =>
    product.sku.toLowerCase().includes(normalized)
      || product.name.toLowerCase().includes(normalized),
  );
};

export const getProductBySku = (sku: string) =>
  PRODUCT_CATALOG.find((product) => product.sku.toLowerCase() === sku.trim().toLowerCase());
