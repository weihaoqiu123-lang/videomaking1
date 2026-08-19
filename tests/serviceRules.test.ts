import assert from 'node:assert/strict';
import test from 'node:test';
import { SERVICE_CATALOG } from '../src/data/serviceCatalog';
import * as mockData from '../src/data/mockData';
import { INITIAL_VIDEO_PERSONNEL, INITIAL_VIDEO_TYPES } from '../src/data/mockData';
import {
  calculateBasePrice,
  calculateUrgentPrice,
  getPersonnelLoad,
  supportsService,
} from '../src/utils/serviceRules';

test('service catalog exposes the approved business order', () => {
  assert.deepEqual(
    SERVICE_CATALOG.map((item) => item.name),
    [
      '产品 AI 展示视频',
      '产品实拍展示视频',
      '社媒 UGC 广告',
      '产品安装视频',
      '纯剪辑任务',
      '定制 / 专项需求',
    ],
  );
});

test('AI dual format applies the 1.5 multiplier', () => {
  assert.equal(
    calculateBasePrice({
      serviceId: 'ai_showcase',
      tierId: 'standard',
      formatId: 'dual',
      quantity: 1,
    }),
    120,
  );
});

test('UGC dual format applies the 1.5 multiplier to a triple pack', () => {
  assert.equal(
    calculateBasePrice({
      serviceId: 'ugc',
      packageId: 'triple',
      formatId: 'dual',
      quantity: 1,
    }),
    180,
  );
});

test('local product search matches SKU and fills complete product information', () => {
  const data = mockData as typeof mockData & {
    searchProducts?: (query: string) => Array<{
      sku: string;
      name: string;
      category: string;
      image: string;
      link: string;
    }>;
  };

  assert.equal(typeof data.searchProducts, 'function');
  const results = data.searchProducts?.('sp38244') ?? [];
  assert.equal(results.length, 1);
  assert.equal(results[0].name, '城市折叠越野电动自行车');
  assert.match(results[0].link, /^https:\/\//);
});

test('editing basic modification charges by output version', () => {
  assert.equal(
    calculateBasePrice({
      serviceId: 'editing',
      editingMode: 'basic',
      outputVersionCount: 3,
    }),
    15,
  );
});

test('approved urgent price adds twenty percent', () => {
  assert.equal(calculateUrgentPrice(120), 144);
  assert.equal(calculateUrgentPrice(null), null);
});

test('personnel load uses all four approved boundaries', () => {
  assert.equal(getPersonnelLoad(0).label, '空闲');
  assert.equal(getPersonnelLoad(5).label, '空闲');
  assert.equal(getPersonnelLoad(6).label, '正常');
  assert.equal(getPersonnelLoad(10).label, '正常');
  assert.equal(getPersonnelLoad(11).label, '较忙');
  assert.equal(getPersonnelLoad(19).label, '较忙');
  assert.equal(getPersonnelLoad(20).label, '爆满');
  assert.equal(getPersonnelLoad(20).isDisabled, true);
});

test('creator support is limited to configured service ids', () => {
  const supported = ['ai_showcase', 'ugc'];

  assert.equal(supportsService(supported, 'ugc'), true);
  assert.equal(supportsService(supported, 'installation'), false);
});

test('personnel roster covers every standard service with selectable creators', () => {
  const standardServiceIds = SERVICE_CATALOG
    .filter((service) => !service.customQuote)
    .map((service) => service.id);

  for (const serviceId of standardServiceIds) {
    const selectableCreators = INITIAL_VIDEO_PERSONNEL.filter(
      (person) => person.currentTasks < person.maxTasks && person.supportedTypeIds.includes(serviceId),
    );
    assert.ok(selectableCreators.length >= 2, `${serviceId} needs two selectable creators`);
  }
});

test('video type choices mirror the single service catalog', () => {
  assert.deepEqual(
    INITIAL_VIDEO_TYPES.map((type) => type.id),
    SERVICE_CATALOG.map((service) => service.id),
  );
});
