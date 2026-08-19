import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, ExternalLink,
  FileText, Sparkles, X, Zap,
} from 'lucide-react';
import type { TaskItem, VideoPersonnel, VideoType } from '../types';
import type { PortfolioItem } from '../data/portfolioData';
import { portfolioMembers } from '../data/portfolioData';
import {
  AI_SHOWCASE_TIERS, INTENDED_USE_OPTIONS, SERVICE_CATALOG, getServiceById,
  type FormatId, type ServiceId, type ServiceTierId,
} from '../data/serviceCatalog';
import {
  getAllowedDurations, getOrderFormConfig, getTypeSwitchClearLabels,
  type EditingMode,
} from '../data/orderFormConfig';
import {
  calculateBasePrice, calculateUrgentPrice, getPersonnelLoad, supportsService,
} from '../utils/serviceRules';
import { getInitialNodeForService, getMainStatusFromNode } from '../utils/taskUtils';
import { getProductBySku, searchProducts } from '../data/productCatalog';

interface OrderCreateViewProps {
  videoTypes: VideoType[];
  videoPersonnel: VideoPersonnel[];
  onSubmitTask: (newTask: Omit<TaskItem, 'id' | 'taskNo' | 'createdAt' | 'updatedAt' | 'logs' | 'nodeData'>) => void;
  onNavigateToOrders: () => void;
  onOpenPortfolio?: () => void;
  onOpenPortfolioWork?: (workId: string) => void;
  referenceWork?: PortfolioItem | null;
  preselectedVideoTypeId?: ServiceId | null;
  onClearReferenceWork?: () => void;
}

interface SkuRow { sku: string; name: string; }

const initialDetails = {
  materialUrl: '', requirements: '', sellingPoints: '', brandAssetUrl: '',
  referenceUrl: '', projectGoal: '', installationSteps: '', manualUrl: '',
  accessories: '', sourceMaterialUrl: '', projectBrief: '',
};

const formatNames: Record<FormatId, string> = {
  landscape: '16:9 横版', portrait: '9:16 竖版', dual: '横竖双版',
};

const orderStages = [
  ['01', '选择视频类型'], ['02', '填写产品和素材'],
  ['03', '选择专属规格'], ['04', '选择制作人并确认价格'],
] as const;

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="order2-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
);

const Choice: React.FC<{ active: boolean; onClick: () => void; title: string; detail?: string }> = ({ active, onClick, title, detail }) => (
  <button type="button" className={`order2-choice ${active ? 'is-active' : ''}`} onClick={onClick}>
    <span className="order2-choice-mark">{active && <Check size={13} />}</span>
    <span><strong>{title}</strong>{detail && <small>{detail}</small>}</span>
  </button>
);

export const OrderCreateView: React.FC<OrderCreateViewProps> = ({
  videoPersonnel, onSubmitTask, onNavigateToOrders, onOpenPortfolio,
  onOpenPortfolioWork, referenceWork, preselectedVideoTypeId, onClearReferenceWork,
}) => {
  const initialServiceId = preselectedVideoTypeId || referenceWork?.serviceId || 'ai_showcase';
  const [serviceId, setServiceId] = useState<ServiceId>(initialServiceId);
  const [pendingServiceId, setPendingServiceId] = useState<ServiceId | null>(null);
  const [skuRows, setSkuRows] = useState<SkuRow[]>([
    { sku: referenceWork?.sku || '', name: referenceWork?.productName || '' },
  ]);
  const [productCategory, setProductCategory] = useState('');
  const [productLink, setProductLink] = useState('');
  const [productImage, setProductImage] = useState(referenceWork?.image || '');
  const [details, setDetails] = useState(initialDetails);
  const [sampleStatus, setSampleStatus] = useState('待寄送');
  const [needsNarration, setNeedsNarration] = useState(false);
  const [tierId, setTierId] = useState<ServiceTierId>('standard');
  const [formatId, setFormatId] = useState<FormatId>('landscape');
  const [duration, setDuration] = useState('30 秒以内');
  const [quantity, setQuantity] = useState(1);
  const [ugcPackage, setUgcPackage] = useState<'single' | 'triple'>('single');
  const [editingMode, setEditingMode] = useState<EditingMode>('basic');
  const [outputVersionCount, setOutputVersionCount] = useState(1);
  const [finishedVideoCount, setFinishedVideoCount] = useState(1);
  const [intendedUses, setIntendedUses] = useState<string[]>(['商品展示']);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [expectedDate, setExpectedDate] = useState('');
  const [urgencyReason, setUrgencyReason] = useState('');
  const [remarks, setRemarks] = useState(referenceWork ? `参考作品：${referenceWork.title}` : '');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPerson, setSubmittedPerson] = useState('');

  const service = getServiceById(serviceId)!;
  const config = getOrderFormConfig(serviceId);
  const durationOptions = getAllowedDurations(serviceId, { tierId, editingMode });
  const availablePersonnel = useMemo(
    () => videoPersonnel.filter((person) => supportsService(person.supportedTypeIds, serviceId)),
    [serviceId, videoPersonnel],
  );
  const selectedPerson = videoPersonnel.find((person) => person.id === selectedPersonId) || null;
  const needsProductInfo = !['editing', 'custom'].includes(serviceId);
  const productMatches = useMemo(
    () => searchProducts(skuRows[0]?.sku || ''),
    [skuRows],
  );
  const basePrice = calculateBasePrice({
    serviceId, tierId, formatId, packageId: ugcPackage, editingMode,
    outputVersionCount, finishedVideoCount, quantity,
  });
  const urgentPrice = calculateUrgentPrice(basePrice);

  useEffect(() => { if (preselectedVideoTypeId) setServiceId(preselectedVideoTypeId); }, [preselectedVideoTypeId]);
  useEffect(() => {
    setDuration(getAllowedDurations(serviceId, { tierId, editingMode })[0]);
  }, [serviceId, tierId, editingMode]);

  const updateDetail = (key: keyof typeof initialDetails, value: string) => setDetails((current) => ({ ...current, [key]: value }));
  const updateSku = (index: number, key: keyof SkuRow, value: string) => {
    setSkuRows((rows) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
    if (key === 'sku') {
      const product = getProductBySku(value);
      if (product) {
        setSkuRows((rows) => rows.map((row, i) => i === index ? { sku: product.sku, name: product.name } : row));
        setProductCategory(product.category);
        setProductImage(product.image);
        setProductLink(product.link);
      }
    }
  };
  const toggleUse = (use: string) => setIntendedUses((uses) => uses.includes(use) ? uses.filter((item) => item !== use) : [...uses, use]);

  const applyServiceSwitch = (nextId: ServiceId) => {
    const nextConfig = getOrderFormConfig(nextId);
    setServiceId(nextId); setPendingServiceId(null); setDetails(initialDetails);
    setSampleStatus('待寄送'); setNeedsNarration(false); setTierId('standard');
    setFormatId(nextConfig.defaultFormatId || 'landscape'); setQuantity(1);
    setUgcPackage('single'); setEditingMode('basic');
    setOutputVersionCount(1); setFinishedVideoCount(1); setSelectedPersonId('');
    setError(''); setSkuRows((rows) => [rows[0] || { sku: '', name: '' }]);
  };

  const formatSummary = formatNames[formatId];
  const specificationSummary = serviceId === 'ai_showcase'
    ? AI_SHOWCASE_TIERS.find((tier) => tier.id === tierId)?.name || '标准版'
    : serviceId === 'ugc' ? ugcPackage === 'triple' ? '三条测试包' : '单条'
    : serviceId === 'editing' ? editingMode === 'basic' ? '基础修改' : '常规混剪'
    : service.customQuote ? '项目确认后报价' : '标准服务';
  const summaryQuantity = serviceId === 'editing'
    ? editingMode === 'basic' ? `${outputVersionCount} 个输出版本` : `${finishedVideoCount} 条成片`
    : serviceId === 'ugc' && ugcPackage === 'triple' ? `${quantity} 组，共 ${quantity * 3} 条` : `${quantity} 条`;

  const validate = () => {
    if (needsProductInfo && (!skuRows[0]?.sku.trim() || !skuRows[0]?.name.trim())) return '请填写 SKU 并选择对应商品。';
    if (serviceId === 'ai_showcase' && !productLink.trim()) return '请填写商品链接或通过 SKU 选择商品。';
    if (serviceId === 'editing' && !details.sourceMaterialUrl.trim()) return '请填写原始素材地址。';
    if (serviceId === 'custom' && !details.projectBrief.trim()) return '请填写项目描述。';
    if (!selectedPerson) return '请选择可承接此类型的制作人。';
    if (getPersonnelLoad(selectedPerson.currentTasks).isDisabled) return '该制作人当前爆满，请选择其他制作人。';
    if (isUrgent && !expectedDate) return '申请加急时，请填写期望完成时间。';
    return '';
  };

  const handleSubmit = () => {
    const nextError = validate();
    if (nextError) { setError(nextError); return; }
    if (!selectedPerson) return;
    const product = skuRows[0] || { sku: 'CUSTOM', name: '定制视频项目' };
    const ratio: TaskItem['videoRatio'] = formatId === 'portrait' ? '9:16' : '16:9';
    const legacyDuration: TaskItem['videoDuration'] = duration.includes('30') || duration.includes('15') || duration.includes('20') ? '<30s' : '<60s';
    const legacySample: TaskItem['sampleStatus'] = sampleStatus === '已到样' ? 'arrived' : sampleStatus === '寄送中' ? 'on_way' : 'not_needed';
    onSubmitTask({
      sku: product.sku || 'CUSTOM', productName: product.name || '定制视频项目',
      productCategory, productImage, productLink, videoTypeId: service.id,
      videoTypeName: service.name, serviceId, intendedUses,
      serviceTierId: serviceId === 'ai_showcase' ? tierId : undefined,
      serviceTierName: specificationSummary,
      outputFormatId: formatId,
      outputFormatName: formatSummary, quantity, basePrice,
      urgentApprovedPrice: isUrgent ? urgentPrice : null,
      serviceDetails: {
        ...details, sampleStatus, needsNarration, duration, ugcPackage,
        editingMode, outputVersionCount, finishedVideoCount,
        skuList: skuRows.map((row) => `${row.sku} ${row.name}`),
      },
      videoPersonId: selectedPerson.id, videoPersonName: selectedPerson.name,
      isUrgent, urgencyStatus: isUrgent ? 'pending' : undefined,
      urgencyReason: isUrgent ? urgencyReason.trim() : undefined,
      targetDate: expectedDate || undefined,
      videoRatio: ratio, videoDuration: legacyDuration,
      needsPerson: needsNarration, sampleStatus: legacySample, remarks,
      mainStatus: getMainStatusFromNode(getInitialNodeForService(serviceId, isUrgent)),
      currentNode: getInitialNodeForService(serviceId, isUrgent),
      currentNodeName: isUrgent ? '待加急审核' : '待视频组确认',
      creatorName: '运营-刘敏',
    });
    setSubmittedPerson(selectedPerson.name); setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="order2-success">
        <CheckCircle2 size={46} /><p>需求已提交</p>
        <h2>{isUrgent ? '加急申请已进入确认队列' : `需求已进入 ${submittedPerson} 的任务队列`}</h2>
        <span>{isUrgent ? '视频组会确认能否安排，并以确认后的排期和费用为准。' : '你可以在我的视频订单中继续查看进度。'}</span>
        <div><button type="button" onClick={onNavigateToOrders}>查看我的视频订单</button><button type="button" onClick={() => { setIsSubmitted(false); setSelectedPersonId(''); }}>继续创建</button></div>
      </div>
    );
  }

  return (
    <div className="order2-page">
      <section className="order2-intro">
        <div><span><Sparkles size={13} /> VIDEO PORTFOLIO</span><h2>还没确定视频方向？</h2><p>先查看不同类型的精选作品，确认效果后再回来创建需求。</p></div>
        <button type="button" onClick={onOpenPortfolio}>查看作品集 <ArrowRight size={16} /></button>
      </section>

      {referenceWork && <div className="order2-reference"><img src={referenceWork.image} alt="" /><span><small>已带入参考作品</small><strong>{referenceWork.title}</strong></span><button type="button" onClick={onClearReferenceWork} aria-label="清除参考作品"><X size={17} /></button></div>}

      <header className="order2-header">
        <div><span>VIDEO REQUEST</span><h1>创建视频需求</h1><p>按四个阶段填写，价格和排队情况会在提交前集中确认。</p></div>
        <ol>{orderStages.map(([number, label]) => <li key={number}><b>{number}</b><span>{label}</span></li>)}</ol>
      </header>

      <main className="order2-layout"><div className="order2-form">
        <section className="order2-section" id="order-stage-1">
          <div className="order2-section-heading"><span>01</span><div><h2>选择视频类型</h2><p>选择后，下方只展示该类型需要的信息和规格。</p></div></div>
          <div className="order2-service-grid">
            {SERVICE_CATALOG.filter((item) => item.id !== 'custom').map((item) => <button type="button" key={item.id} className={serviceId === item.id ? 'is-active' : ''} onClick={() => item.id !== serviceId && setPendingServiceId(item.id)}><small>{item.number}</small><strong>{item.name}</strong><span>{item.priceLabel}</span>{serviceId === item.id && <Check size={16} />}</button>)}
          </div>
          <button type="button" className={`order2-custom-service ${serviceId === 'custom' ? 'is-active' : ''}`} onClick={() => serviceId !== 'custom' && setPendingServiceId('custom')}><span><small>06 / CUSTOM</small><strong>定制 / 专项需求</strong><em>不符合标准服务的项目，在确认 Brief 后报价</em></span><ChevronRight size={20} /></button>
        </section>

        <section className="order2-section" id="order-stage-2">
          <div className="order2-section-heading"><span>02</span><div><h2>{config.materialTitle}</h2><p>{config.materialHint}</p></div></div>
          {needsProductInfo && <div className="order2-sku-list">
            {skuRows.map((row, index) => <div className="order2-sku-row" key={index}><Field label="SKU（必填）" hint="输入 SKU 后从本地商品数据中选择"><input list="product-sku-options" value={row.sku} onChange={(e) => updateSku(index, 'sku', e.target.value)} placeholder="输入 SKU 搜索商品" /></Field><Field label="产品名称（必填）"><input value={row.name} onChange={(e) => updateSku(index, 'name', e.target.value)} placeholder="选择商品后自动填充" /></Field></div>)}
            <datalist id="product-sku-options">{productMatches.map((product) => <option key={product.sku} value={product.sku}>{product.name}</option>)}</datalist>
          </div>}
          {serviceId === 'ai_showcase' && <div className="order2-fields"><Field label="商品链接（必填）"><input value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="选择商品后自动填充，也可手动输入" /></Field><Field label="摄影原图地址（选填）"><input value={details.materialUrl} onChange={(e) => updateDetail('materialUrl', e.target.value)} placeholder="https:// 或内部共享盘地址" /></Field></div>}
          {serviceId === 'live_showcase' && <><div className="order2-fields"><Field label="实拍要求"><textarea value={details.requirements} onChange={(e) => updateDetail('requirements', e.target.value)} placeholder="需要重点展示的结构、材质、场景或动作" /></Field><Field label="样品状态"><select value={sampleStatus} onChange={(e) => setSampleStatus(e.target.value)}>{config.sampleStatuses?.map((status) => <option key={status}>{status}</option>)}</select></Field></div><label className="order2-checkline"><input type="checkbox" checked={needsNarration} onChange={(e) => setNeedsNarration(e.target.checked)} />需要人物讲解</label></>}
          {serviceId === 'ugc' && <div className="order2-fields"><Field label="产品资料地址"><input value={details.materialUrl} onChange={(e) => updateDetail('materialUrl', e.target.value)} placeholder="产品资料或商品链接" /></Field><Field label="核心卖点与表达方向"><textarea value={details.sellingPoints} onChange={(e) => updateDetail('sellingPoints', e.target.value)} placeholder="填写希望测试的钩子、痛点或卖点" /></Field></div>}
          {serviceId === 'installation' && <div className="order2-fields"><Field label="安装步骤"><textarea value={details.installationSteps} onChange={(e) => updateDetail('installationSteps', e.target.value)} placeholder="列出关键步骤和常见易错点" /></Field><Field label="说明书地址"><input value={details.manualUrl} onChange={(e) => updateDetail('manualUrl', e.target.value)} placeholder="可访问的说明书地址" /></Field><Field label="配件情况"><input value={details.accessories} onChange={(e) => updateDetail('accessories', e.target.value)} placeholder="是否齐全，有无备用件" /></Field><Field label="样品状态"><select value={sampleStatus} onChange={(e) => setSampleStatus(e.target.value)}>{config.sampleStatuses?.map((status) => <option key={status}>{status}</option>)}</select></Field></div>}
          {serviceId === 'editing' && <Field label="原始素材地址" hint="请确认制作人可以直接访问"><input value={details.sourceMaterialUrl} onChange={(e) => updateDetail('sourceMaterialUrl', e.target.value)} placeholder="https:// 或内部共享盘地址" /></Field>}
          {serviceId === 'custom' && <div className="order2-fields"><Field label="项目描述 / Brief"><textarea value={details.projectBrief} onChange={(e) => updateDetail('projectBrief', e.target.value)} placeholder="描述项目背景、目标、交付内容和特殊要求" /></Field><Field label="品牌资料地址"><input value={details.brandAssetUrl} onChange={(e) => updateDetail('brandAssetUrl', e.target.value)} placeholder="品牌规范与素材地址" /></Field><Field label="参考作品"><input value={details.referenceUrl} onChange={(e) => updateDetail('referenceUrl', e.target.value)} placeholder="参考链接" /></Field></div>}
          <div className="order2-use-block"><div><strong>预计用途，可多选</strong><small>用途仅帮助制作人理解需求和进行内部统计，不影响基础费用。</small></div><div>{INTENDED_USE_OPTIONS.map((use) => <button type="button" key={use} className={intendedUses.includes(use) ? 'is-active' : ''} onClick={() => toggleUse(use)}>{intendedUses.includes(use) && <Check size={13} />}{use}</button>)}</div></div>
        </section>

        <section className="order2-section" id="order-stage-3">
          <div className="order2-section-heading"><span>03</span><div><h2>选择该类型专属规格</h2><p>比例、时长和计价单位会随类型自动限制。</p></div></div>
          {serviceId === 'ai_showcase' && <div className="order2-choice-grid">{AI_SHOWCASE_TIERS.map((tier) => <Choice key={tier.id} active={tierId === tier.id} onClick={() => setTierId(tier.id)} title={`${tier.name} / ${tier.price} USD`} detail={`${tier.description} ${tier.duration}`} />)}</div>}
          {serviceId === 'ugc' && <><div className="order2-choice-grid"><Choice active={ugcPackage === 'single'} onClick={() => setUgcPackage('single')} title="单条 / 50 USD" detail="验证一个主要钩子或卖点方向" /><Choice active={ugcPackage === 'triple'} onClick={() => setUgcPackage('triple')} title="三条测试包 / 120 USD" detail="三种不同钩子或卖点方向" /></div><p className="order2-note">{config.packageNote}</p></>}
          {serviceId === 'editing' && <div className="order2-choice-grid"><Choice active={editingMode === 'basic'} onClick={() => setEditingMode('basic')} title="基础修改 / 5 USD" detail="按输出版本数量计价" /><Choice active={editingMode === 'mix'} onClick={() => setEditingMode('mix')} title="常规混剪 / 40 USD" detail="按成片数量计价" /></div>}
          <div className="order2-spec-grid"><Field label="输出比例"><div className="order2-inline-choices">{config.formatIds.map((id) => <button type="button" key={id} className={formatId === id ? 'is-active' : ''} onClick={() => setFormatId(id)}>{formatNames[id]}</button>)}</div></Field><Field label="成片时长"><select value={duration} onChange={(e) => setDuration(e.target.value)}>{durationOptions.map((item) => <option key={item}>{item}</option>)}</select></Field></div>
          {serviceId === 'editing' ? <div className="order2-counter"><span>{editingMode === 'basic' ? '输出版本数量' : '成片数量'}</span><button type="button" onClick={() => editingMode === 'basic' ? setOutputVersionCount(Math.max(1, outputVersionCount - 1)) : setFinishedVideoCount(Math.max(1, finishedVideoCount - 1))}>−</button><strong>{editingMode === 'basic' ? outputVersionCount : finishedVideoCount}</strong><button type="button" onClick={() => editingMode === 'basic' ? setOutputVersionCount(outputVersionCount + 1) : setFinishedVideoCount(finishedVideoCount + 1)}>+</button><small>{editingMode === 'basic' ? '同一成片导出多少个不同规格版本' : '需要交付多少条独立成片'}</small></div> : serviceId !== 'custom' && <div className="order2-counter"><span>需求数量</span><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity(quantity + 1)}>+</button></div>}
        </section>

        <section className="order2-section" id="order-stage-4">
          <div className="order2-section-heading"><span>04</span><div><h2>选择制作人并确认价格</h2><p>只展示可承接当前类型的成员，爆满成员不可选择。</p></div></div>
          <div className="order2-person-grid">{availablePersonnel.map((person) => {
            const load = getPersonnelLoad(person.currentTasks); const portfolio = portfolioMembers.find((member) => member.id === person.id);
            return <article key={person.id} className={`${selectedPersonId === person.id ? 'is-active' : ''} ${load.isDisabled ? 'is-disabled' : ''}`}><button type="button" disabled={load.isDisabled} onClick={() => setSelectedPersonId(person.id)}><img src={person.avatar} alt="" /><span><strong>{person.name}</strong><small>{person.specialty}</small><em className={`is-${load.key}`}>{load.label}</em></span>{selectedPersonId === person.id && <Check size={17} />}</button>{portfolio && <button type="button" className="order2-portfolio-link" onClick={() => onOpenPortfolioWork?.(portfolio.representativeWorkId)}>查看对应作品 <ExternalLink size={13} /></button>}</article>;
          })}</div>
          <div className="order2-urgent"><div><Zap size={19} /><span><strong>申请加急</strong><small>提交期望完成日期，由视频组确认是否能够安排；若加急成功，则增加 20% 费用。</small></span></div><button type="button" className={isUrgent ? 'is-active' : ''} onClick={() => { setIsUrgent((value) => !value); if (isUrgent) { setExpectedDate(''); setUrgencyReason(''); } }} aria-pressed={isUrgent}><span /></button>{isUrgent && <div className="order2-fields"><Field label="期望完成日期"><input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} /></Field><Field label="加急说明（选填）"><textarea value={urgencyReason} onChange={(e) => setUrgencyReason(e.target.value)} placeholder="补充活动节点或加急原因" /></Field></div>}</div>
          <Field label="补充说明，可选"><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="其他需要制作人注意的内容" /></Field>
        </section>
      </div>

      <aside className="order2-summary">
        <span className="order2-summary-kicker">需求与费用确认</span><h2>{service.name}</h2>
        <dl><div><dt>视频类型</dt><dd>{service.name}</dd></div><div><dt>规格档位</dt><dd>{specificationSummary}</dd></div><div><dt>输出比例</dt><dd>{formatSummary}</dd></div><div><dt>数量</dt><dd>{summaryQuantity}</dd></div><div><dt>制作人</dt><dd>{selectedPerson?.name || '待选择'}</dd></div><div><dt>当前排队状态</dt><dd>{selectedPerson ? getPersonnelLoad(selectedPerson.currentTasks).label : '待选择'}</dd></div></dl>
        <div className="order2-price"><span>预计内部结算价格</span><strong>{basePrice === null ? '确认后报价' : `${basePrice} USD`}</strong>{isUrgent && <p>加急通过后：<b>{urgentPrice === null ? '确认后报价' : `${urgentPrice} USD`}</b></p>}</div>
        <p className="order2-payment-note"><FileText size={15} />提交需求时无需支付，最终以视频组确认为准。</p>
        {error && <p className="order2-error">{error}</p>}
        <button type="button" className="order2-submit" onClick={handleSubmit}>确认信息并提交需求 <ArrowRight size={17} /></button>
      </aside></main>

      {pendingServiceId && <div className="order2-switch-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingServiceId(null); }}><div className="order2-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="switch-title"><button type="button" onClick={() => setPendingServiceId(null)} aria-label="关闭"><X size={18} /></button><span><Clock3 size={17} /> 切换前确认</span><h2 id="switch-title">切换到“{getServiceById(pendingServiceId)?.name}”？</h2><p>为避免错误沿用，以下已填写内容会被清空：</p><ul>{getTypeSwitchClearLabels(serviceId, pendingServiceId).map((label) => <li key={label}>{label}</li>)}</ul><small>预计用途和第一条产品信息会保留。</small><div><button type="button" onClick={() => setPendingServiceId(null)}>继续填写当前类型</button><button type="button" onClick={() => applyServiceSwitch(pendingServiceId)}>确认切换</button></div></div></div>}
    </div>
  );
};
