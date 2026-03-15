$ErrorActionPreference = 'Stop'

$company = '신신지업사'
$owner = '이재진'
$address = '서울 중구 을지로35길 8, 1층(방산시장 내)'
$phone = '02-2269-4933'
$phone2 = '02-2268-9059'
$email = 'sinsin4933@gmail.com'
$hours = '평일 08:00~18:00 / 토요일·공휴일 08:00~14:00 / 일요일 휴무'
$blog = 'https://blog.naver.com/stepano6572'
$baseUrl = 'https://xn--vf4b93ba870atzg.com'
$naverMap = 'https://map.naver.com/v5/search/%EC%84%9C%EC%9A%B8%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C35%EA%B8%B8%208'
$kakaoMap = 'https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EC%A4%91%EA%B5%AC%20%EC%9D%84%EC%A7%80%EB%A1%9C35%EA%B8%B8%208'

function Get-NavHtml([string]$current) {
  $items = @(
    @{ id = 'products'; href = 'products.html'; label = '상품안내' },
    @{ id = 'quote'; href = 'quote.html'; label = '맞춤견적' },
    @{ id = 'shipping'; href = 'shipping.html'; label = '거래안내' },
    @{ id = 'contact'; href = 'contact.html'; label = '문의/오시는 길' }
  )

  return ($items | ForEach-Object {
    $class = if ($_.id -eq $current) { ' class="is-current"' } else { '' }
    "<a href=""$($_.href)""$class>$($_.label)</a>"
  }) -join "`n        "
}

function Get-HeaderHtml([string]$current) {
  $nav = Get-NavHtml $current
@"
<div class="shop-utility">
  <div class="container utility-inner">
    <div class="utility-meta">
      <span><strong>대표번호</strong> <a href="tel:$phone">$phone</a></span>
      <span><strong>영업시간</strong> $hours</span>
      <span><strong>방문수령</strong> 전화 문의 후 방문수령 가능</span>
    </div>
    <button class="mobile-utility-toggle" data-mobile-toggle aria-expanded="false" aria-controls="mobileNav">메뉴</button>
  </div>
</div>
<header class="header">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="$company 홈">
      <span class="brand-badge">신신</span>
      <span class="brand-copy">
        <span class="brand-title">$company</span>
        <span class="brand-sub">박스 · 골판지 · 포장자재 전문 B2B 공급</span>
      </span>
    </a>
    <div class="header-actions">
      <nav class="nav" aria-label="주요 메뉴">
        $nav
      </nav>
      <a class="btn primary header-cta" href="quote.html">맞춤견적 요청</a>
    </div>
  </div>
  <div class="mobile-nav" id="mobileNav" data-mobile-nav>
    <div class="container">
      $nav
      <a href="quote.html">맞춤견적 요청</a>
    </div>
  </div>
</header>
"@
}

function Get-FooterHtml() {
@"
<div class="mobile-sticky-cta" aria-label="모바일 문의">
  <a class="btn primary" href="quote.html">견적요청</a>
  <a class="btn" href="tel:$phone">전화문의</a>
</div>
<footer class="footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="footer-title">$company</div>
      <div class="footer-meta">
        <div>대표자: $owner</div>
        <div>주소: $address</div>
        <div>대표번호: <a href="tel:$phone">$phone</a> / 보조번호: <a href="tel:$phone2">$phone2</a></div>
        <div>이메일: <a href="mailto:$email">$email</a></div>
        <div>영업시간: $hours</div>
      </div>
    </div>
    <div>
      <div class="footer-links">
        <a href="shipping.html">거래안내</a>
        <a href="privacy.html">개인정보처리방침</a>
        <a href="terms.html">이용약관</a>
        <a href="$blog" target="_blank" rel="noopener noreferrer">블로그</a>
      </div>
    </div>
  </div>
</footer>
"@
}

function Write-Page([string]$path, [string]$title, [string]$desc, [string]$current, [string]$bodyClass, [string]$main, [string]$ogImage, [string]$extraHead = '', [string]$extraScripts = '') {
  $header = Get-HeaderHtml $current
  $footer = Get-FooterHtml
  $bodyAttr = if ($bodyClass) { " class=""$bodyClass""" } else { '' }
  $html = @"
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title | $company</title>
  <meta name="description" content="$desc">
  <link rel="canonical" href="$baseUrl/$path">
  <meta property="og:title" content="$title | $company">
  <meta property="og:description" content="$desc">
  <meta property="og:type" content="website">
  <meta property="og:url" content="$baseUrl/$path">
  <meta property="og:image" content="$baseUrl/$ogImage">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="shortcut icon" href="assets/favicon.svg">
  <link rel="stylesheet" href="assets/style.css">
  $extraHead
</head>
<body$bodyAttr>
$header
$main
$footer
<script src="assets/site.js"></script>
$extraScripts
</body>
</html>
"@
  Set-Content -Path $path -Value $html -Encoding utf8
}

$contactMain = @"
<section class="section">
  <div class="container contact-shell">
    <div class="breadcrumb"><a href="index.html">홈</a> / 문의 / 오시는 길</div>
    <div class="contact-grid">
      <div class="page-hero">
        <div class="section-label">Contact</div>
        <h1 class="page-title">문의 / 오시는 길</h1>
        <div class="contact-list">
          <div><span class="contact-label">대표번호</span><span class="contact-value"><a href="tel:$phone">$phone</a></span></div>
          <div><span class="contact-label">보조번호</span><span class="contact-value"><a href="tel:$phone2">$phone2</a></span></div>
          <div><span class="contact-label">이메일</span><span class="contact-value"><a href="mailto:$email">$email</a></span></div>
          <div><span class="contact-label">주소</span><span class="contact-value">$address</span></div>
          <div><span class="contact-label">영업시간</span><span class="contact-value">$hours</span></div>
        </div>
      </div>
      <figure class="contact-hero-media"><img src="assets/images/home/storefront-hero.jpg" alt="신신지업사 매장 전경"></figure>
    </div>
    <section class="support-shell">
      <div class="section-head compact"><div><div class="section-label">Directions</div><h2 class="section-title">오시는 길</h2></div></div>
      <div class="contact-card-grid">
        <article class="contact-card"><h3>주소</h3><p>$address</p></article>
        <article class="contact-card"><h3>지도 보기</h3><p>지도 서비스에서 매장 위치를 바로 확인하실 수 있습니다.</p><div class="contact-actions"><a class="btn small" href="$naverMap" target="_blank" rel="noopener noreferrer">네이버 지도</a><a class="btn small" href="$kakaoMap" target="_blank" rel="noopener noreferrer">카카오맵</a></div></article>
      </div>
    </section>
    <section class="support-shell">
      <div class="section-head compact"><div><div class="section-label">Visit Guide</div><h2 class="section-title">방문 안내</h2></div></div>
      <div class="support-summary-grid">
        <article class="support-card"><h3>방문수령</h3><p>준비 여부를 먼저 확인한 뒤 방문수령하실 수 있습니다.</p></article>
        <article class="support-card"><h3>수령 방식</h3><p>택배, 퀵, 방문수령 중 가능한 방법을 안내합니다.</p></article>
        <article class="support-card"><h3>영업시간</h3><p>$hours</p></article>
        <article class="support-card"><h3>블로그</h3><p><a href="$blog" target="_blank" rel="noopener noreferrer">운영 블로그 보기</a></p></article>
      </div>
    </section>
    <section class="support-shell">
      <div class="section-head compact"><div><div class="section-label">Inquiry</div><h2 class="section-title">문의</h2></div></div>
      <div class="contact-card-grid">
        <article class="contact-card"><h3>전화 문의</h3><p>규격과 수량이 정리되지 않아도 우선 문의하실 수 있습니다.</p></article>
        <article class="contact-card"><h3>이메일 문의</h3><p>도면이나 참고 내용을 함께 보내실 경우 이메일 문의를 이용해 주세요.</p></article>
      </div>
      <div class="cta-row"><a class="btn primary" href="quote.html">맞춤견적 요청</a><a class="btn" href="tel:$phone">전화문의</a></div>
    </section>
  </div>
</section>
"@
Write-Page 'contact.html' '문의 / 오시는 길' '전화, 이메일, 주소, 영업시간과 오시는 길 정보를 안내합니다.' 'contact' '' $contactMain 'assets/images/home/storefront-hero.jpg'

$shippingMain = @"
<section class="section">
  <div class="container support-shell">
    <div>
      <div class="breadcrumb"><a href="index.html">홈</a> / 거래안내</div>
      <h1 class="page-title">거래안내</h1>
      <p class="page-lead">주문, 결제, 배송과 취소·변경 관련 안내를 정리한 문서입니다. 실제 진행 가능 범위는 품목과 수량에 따라 달라질 수 있습니다.</p>
    </div>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">결제 안내</h2>
      <table class="support-table">
        <tr><th>결제 방식</th><td>주문 내용 확인 후 가능한 결제 방법을 안내합니다. 카드 결제는 지원하지 않습니다.</td></tr>
        <tr><th>입금 확인</th><td>입금 확인 후 출고 또는 제작 준비를 진행합니다.</td></tr>
        <tr><th>계좌 정보</th><td>신한은행 100-036-265883 / 예금주: 신신지업사(이재진)</td></tr>
      </table>
    </section>
    <div class="support-summary-grid">
      <article class="support-card"><h3>배송 방식</h3><p>택배, 퀵, 방문수령 중 가능한 방식으로 안내합니다.</p></article>
      <article class="support-card"><h3>배송비</h3><p>기본 착불이며, 지역과 부피에 따라 별도 안내할 수 있습니다.</p></article>
      <article class="support-card"><h3>기성품 일정</h3><p>재고가 있는 기성품은 보통 1~3일 범위에서 일정을 안내합니다.</p></article>
      <article class="support-card"><h3>세금계산서</h3><p>필요 자료 확인 후 발행 가능합니다.</p></article>
    </div>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">주문 절차</h2>
      <ul class="support-list">
        <li>문의 접수 후 품목, 규격, 수량, 수령 방식을 확인합니다.</li>
        <li>확인된 내용 기준으로 견적과 진행 가능 일정을 안내합니다.</li>
        <li>입금 확인 후 제작 또는 출고를 준비합니다.</li>
        <li>택배, 퀵, 방문수령 중 협의된 방식으로 진행합니다.</li>
      </ul>
    </section>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">취소 / 변경 / 환불</h2>
      <ul class="support-list">
        <li>출고 전이거나 제작 전 단계인 경우 변경 가능 여부를 먼저 확인합니다.</li>
        <li>맞춤 제작 품목은 사양 확정 이후 취소·변경 범위가 제한될 수 있습니다.</li>
        <li>환불 가능 여부는 진행 단계와 품목 상태를 확인한 뒤 안내합니다.</li>
      </ul>
      <div class="cta-row"><a class="btn primary" href="quote.html">맞춤견적 요청</a><a class="btn" href="products.html">상품안내</a></div>
    </section>
  </div>
</section>
"@
Write-Page 'shipping.html' '거래안내' '결제, 배송, 주문 절차와 취소·변경·환불 기준을 안내합니다.' 'shipping' '' $shippingMain 'assets/images/home/board-closeup.jpg'

$taxMain = @"
<section class="section">
  <div class="container support-shell">
    <div>
      <div class="breadcrumb"><a href="index.html">홈</a> / 세금계산서 안내</div>
      <h1 class="page-title">세금계산서 안내</h1>
      <p class="page-lead">세금계산서 발행 조건과 필요한 자료, 자주 묻는 내용을 정리했습니다.</p>
    </div>
    <div class="support-summary-grid">
      <article class="support-card"><h3>발행 조건</h3><p>거래 내용 확인 후 발행 가능 여부를 안내합니다.</p></article>
      <article class="support-card"><h3>필요 자료</h3><p>사업자등록 정보와 수신 이메일을 확인합니다.</p></article>
      <article class="support-card"><h3>확인 시점</h3><p>주문 진행 시점에 필요한 정보를 함께 확인합니다.</p></article>
      <article class="support-card"><h3>문의</h3><p>전화 또는 이메일로 요청하실 수 있습니다.</p></article>
    </div>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">발행 절차</h2>
      <table class="support-table">
        <tr><th>1. 거래 확인</th><td>주문 또는 견적 진행 내용을 먼저 확인합니다.</td></tr>
        <tr><th>2. 자료 수집</th><td>사업자등록 정보와 수신 이메일을 전달해 주세요.</td></tr>
        <tr><th>3. 발행 안내</th><td>확인된 정보를 기준으로 발행 여부와 시점을 안내합니다.</td></tr>
        <tr><th>4. 추가 문의</th><td>수정이 필요한 경우 전화 또는 이메일로 다시 연락해 주세요.</td></tr>
      </table>
    </section>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">FAQ</h2>
      <ul class="support-list">
        <li>세금계산서는 주문 또는 견적 진행 내용을 확인한 뒤 안내합니다.</li>
        <li>이메일 주소가 정확하지 않으면 발행 안내가 지연될 수 있습니다.</li>
        <li>추가 수정이 필요한 경우 다시 확인 절차가 필요할 수 있습니다.</li>
      </ul>
      <div class="cta-row"><a class="btn primary" href="quote.html">맞춤견적 요청</a><a class="btn" href="contact.html">문의/오시는 길</a></div>
    </section>
  </div>
</section>
"@
Write-Page 'tax.html' '세금계산서 안내' '세금계산서 발행 조건과 필요한 자료, FAQ를 안내합니다.' 'shipping' '' $taxMain 'assets/images/home/storefront-hero.jpg'

$privacyMain = @"
<section class="section">
  <div class="container support-shell">
    <div>
      <div class="breadcrumb"><a href="index.html">홈</a> / 개인정보처리방침</div>
      <h1 class="page-title">개인정보처리방침</h1>
      <p class="page-lead">$company는 견적 문의와 거래 상담을 위해 필요한 최소한의 정보를 확인합니다.</p>
    </div>
    <div class="support-summary-grid">
      <article class="support-card"><h3>수집 항목</h3><p>상호 또는 담당자명, 연락처, 이메일, 문의 내용</p></article>
      <article class="support-card"><h3>이용 목적</h3><p>견적 안내, 주문 상담, 문의 응대</p></article>
      <article class="support-card"><h3>보관 범위</h3><p>상담 및 거래 확인에 필요한 범위 내에서 관리합니다.</p></article>
      <article class="support-card"><h3>문의</h3><p><a href="mailto:$email">$email</a> / <a href="tel:$phone">$phone</a></p></article>
    </div>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">안내 사항</h2>
      <ul class="support-list">
        <li>입력하신 정보는 견적과 거래 상담 외 목적으로 사용하지 않습니다.</li>
        <li>필수 정보가 부족한 경우 정확한 안내가 어려울 수 있습니다.</li>
        <li>개인정보 관련 문의는 전화 또는 이메일로 접수해 주세요.</li>
      </ul>
    </section>
  </div>
</section>
"@
Write-Page 'privacy.html' '개인정보처리방침' '견적 문의와 거래 상담을 위한 개인정보 수집 및 이용 범위를 안내합니다.' '' '' $privacyMain 'assets/images/home/storefront-hero.jpg'

$termsMain = @"
<section class="section">
  <div class="container support-shell">
    <div>
      <div class="breadcrumb"><a href="index.html">홈</a> / 이용약관</div>
      <h1 class="page-title">이용약관</h1>
      <p class="page-lead">본 사이트는 상품 안내와 견적 문의를 위한 정적 안내 사이트입니다.</p>
    </div>
    <div class="support-summary-grid">
      <article class="support-card"><h3>사이트 목적</h3><p>상품 정보 제공, 견적 문의 접수, 거래 안내</p></article>
      <article class="support-card"><h3>주문 진행</h3><p>실제 거래는 전화, 이메일, 견적 확인 절차를 통해 진행합니다.</p></article>
      <article class="support-card"><h3>정보 변경</h3><p>품목과 가격, 일정은 상담 내용에 따라 달라질 수 있습니다.</p></article>
      <article class="support-card"><h3>문의</h3><p>오류나 문의 사항은 연락처로 알려 주세요.</p></article>
    </div>
    <section class="section-shell" style="padding:28px;">
      <h2 class="section-title">운영 기준</h2>
      <ul class="support-list">
        <li>사이트에 표시된 정보는 안내용이며 실제 거래 조건은 상담 후 확정됩니다.</li>
        <li>상품 사양, 수량, 배송 방식에 따라 가격과 일정은 변동될 수 있습니다.</li>
        <li>문의와 주문은 전화, 이메일, 견적 요청 폼을 통해 접수합니다.</li>
      </ul>
    </section>
  </div>
</section>
"@
Write-Page 'terms.html' '이용약관' '사이트 이용과 상품 안내, 견적 문의 기준을 안내합니다.' '' '' $termsMain 'assets/images/home/storefront-hero.jpg'

$products = @(
  @{ File='product-01-b-600.html'; Title='택배박스 B-600'; Category='택배박스'; Code='B-600'; Lead='기성품 1~3일'; Spec='600×400×400'; Material='D/W골 BOX'; Price='2,800원'; Min='10개부터'; Desc='택배박스 B-600 규격과 수량, 납품 방식 안내입니다.'; Image='assets/images/home/sample-boxes.jpg'; ImageAlt='박스 샘플 적재 사진'; Calc='2800' },
  @{ File='product-02-b-538.html'; Title='택배박스 B-538'; Category='택배박스'; Code='B-538'; Lead='기성품 1~3일'; Spec='550×380×380'; Material='D/W골 BOX'; Price='2,600원'; Min='10개부터'; Desc='택배박스 B-538 규격과 수량, 납품 방식 안내입니다.'; Image='assets/images/home/sample-boxes.jpg'; ImageAlt='박스 샘플 적재 사진'; Calc='2600' },
  @{ File='product-03-b-535.html'; Title='택배박스 B-535'; Category='택배박스'; Code='B-535'; Lead='기성품 1~3일'; Spec='500×350×350'; Material='D/W골 BOX'; Price='2,400원'; Min='10개부터'; Desc='택배박스 B-535 규격과 수량, 납품 방식 안내입니다.'; Image='assets/images/home/sample-boxes.jpg'; ImageAlt='박스 샘플 적재 사진'; Calc='2400' },
  @{ File='product-04-b-433.html'; Title='택배박스 B-433'; Category='택배박스'; Code='B-433'; Lead='기성품 1~3일'; Spec='450×350×320'; Material='D/W골 BOX'; Price='2,000원'; Min='10개부터'; Desc='택배박스 B-433 규격과 수량, 납품 방식 안내입니다.'; Image='assets/images/home/sample-boxes.jpg'; ImageAlt='박스 샘플 적재 사진'; Calc='2000' },
  @{ File='product-05-item-7.html'; Title='맞춤 제작 상담 ITEM-7'; Category='맞춤 제작 상담'; Code='ITEM-7'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-7 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-06-item-8.html'; Title='맞춤 제작 상담 ITEM-8'; Category='맞춤 제작 상담'; Code='ITEM-8'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-8 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-07-item-9.html'; Title='맞춤 제작 상담 ITEM-9'; Category='맞춤 제작 상담'; Code='ITEM-9'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-9 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-08-item-11.html'; Title='맞춤 제작 상담 ITEM-11'; Category='맞춤 제작 상담'; Code='ITEM-11'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-11 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-09-item-12.html'; Title='맞춤 제작 상담 ITEM-12'; Category='맞춤 제작 상담'; Code='ITEM-12'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-12 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-10-item-13.html'; Title='맞춤 제작 상담 ITEM-13'; Category='맞춤 제작 상담'; Code='ITEM-13'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-13 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-11-g-dw.html'; Title='골판지(양면) G-DW'; Category='골판지(양면)'; Code='G-DW'; Lead='상담 후 안내'; Spec='1580×1100'; Material='DW (A골 + B골)'; Price='4,000원'; Min='10개부터'; Desc='골판지(양면) G-DW 규격과 재질 안내입니다.'; Image='assets/images/home/board-types.jpg'; ImageAlt='골판지 종류 사진'; Calc='4000' },
  @{ File='product-12-g-ska.html'; Title='골판지(양면) G-SKA'; Category='골판지(양면)'; Code='G-SKA'; Lead='상담 후 안내'; Spec='규격 상담'; Material='SK / A골'; Price='3,000원'; Min='10개부터'; Desc='골판지(양면) G-SKA 규격과 재질 안내입니다.'; Image='assets/images/home/board-types.jpg'; ImageAlt='골판지 종류 사진'; Calc='3000' },
  @{ File='product-13-g-skb.html'; Title='골판지(양면) G-SKB'; Category='골판지(양면)'; Code='G-SKB'; Lead='상담 후 안내'; Spec='규격 상담'; Material='SK / B골'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-SKB 규격과 재질 안내입니다.'; Image='assets/images/home/board-types.jpg'; ImageAlt='골판지 종류 사진'; Calc='2000' },
  @{ File='product-14-g-ske.html'; Title='골판지(양면) G-SKE'; Category='골판지(양면)'; Code='G-SKE'; Lead='상담 후 안내'; Spec='규격 상담'; Material='SK / E골'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-SKE 규격과 재질 안내입니다.'; Image='assets/images/home/board-types.jpg'; ImageAlt='골판지 종류 사진'; Calc='2000' },
  @{ File='product-15-g-wke.html'; Title='골판지(양면) G-WKE'; Category='골판지(양면)'; Code='G-WKE'; Lead='상담 후 안내'; Spec='규격 상담'; Material='白 / E골'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-WKE 규격과 재질 안내입니다.'; Image='assets/images/home/board-types.jpg'; ImageAlt='골판지 종류 사진'; Calc='2000' },
  @{ File='product-16-g-klb.html'; Title='골판지(양면) G-KLB'; Category='골판지(양면)'; Code='G-KLB'; Lead='상담 후 안내'; Spec='1100×(800~788)'; Material='KLB / B골'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-KLB 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='2000' },
  @{ File='product-17-g-kle.html'; Title='골판지(양면) G-KLE'; Category='골판지(양면)'; Code='G-KLE'; Lead='상담 후 안내'; Spec='규격 상담'; Material='KLB / E골'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-KLE 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='2000' },
  @{ File='product-18-g-3mo.html'; Title='골판지(양면) G-3MO'; Category='골판지(양면)'; Code='G-3MO'; Lead='상담 후 안내'; Spec='규격 상담'; Material='모조, 모조, 모조(흰색)'; Price='2,000원'; Min='10개부터'; Desc='골판지(양면) G-3MO 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='2000' },
  @{ File='product-19-g-3bl.html'; Title='골판지(양면) G-3BL'; Category='골판지(양면)'; Code='G-3BL'; Lead='상담 후 안내'; Spec='규격 상담'; Material='쓰리먹(검정)'; Price='3,000원'; Min='10개부터'; Desc='골판지(양면) G-3BL 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='3000' },
  @{ File='product-20-item-25.html'; Title='골판지(편면) ITEM-25'; Category='골판지(편면)'; Code='ITEM-25'; Lead='상담 후 안내'; Spec='1100×800'; Material='편면(KLB)'; Price='1,500원'; Min='10개부터'; Desc='골판지(편면) ITEM-25 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='1500' },
  @{ File='product-21-item-26.html'; Title='골판지(편면) ITEM-26'; Category='골판지(편면)'; Code='ITEM-26'; Lead='상담 후 안내'; Spec='1100×788'; Material='편면(모조, 모조)'; Price='1,500원'; Min='10개부터'; Desc='골판지(편면) ITEM-26 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='1500' },
  @{ File='product-22-item-27.html'; Title='골판지(편면) ITEM-27'; Category='골판지(편면)'; Code='ITEM-27'; Lead='상담 후 안내'; Spec='1100×800'; Material='편면(SK/E골, 白E골)'; Price='1,000원'; Min='10개부터'; Desc='골판지(편면) ITEM-27 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='1000' },
  @{ File='product-23-item-28.html'; Title='골판지(편면) ITEM-28'; Category='골판지(편면)'; Code='ITEM-28'; Lead='상담 후 안내'; Spec='800×1100'; Material='편면(白/F골)'; Price='2,000원'; Min='10개부터'; Desc='골판지(편면) ITEM-28 규격과 재질 안내입니다.'; Image='assets/images/home/board-closeup.jpg'; ImageAlt='골판지 근접 사진'; Calc='2000' },
  @{ File='product-24-pvc.html'; Title='PVC 상담 항목'; Category='맞춤 제작 상담'; Code='PVC'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 재질 확인 후 안내'; Price='견적 문의'; Min='상담 후 안내'; Desc='PVC 상담 항목 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-25-item-30.html'; Title='맞춤 제작 상담 ITEM-30'; Category='맞춤 제작 상담'; Code='ITEM-30'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-30 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' },
  @{ File='product-26-item-31.html'; Title='맞춤 제작 상담 ITEM-31'; Category='맞춤 제작 상담'; Code='ITEM-31'; Lead='상담 후 안내'; Spec='규격 상담'; Material='용도와 사양 확인 후 결정'; Price='견적 문의'; Min='상담 후 안내'; Desc='맞춤 제작 상담 ITEM-31 안내 페이지입니다.'; Image=''; ImageAlt=''; Calc='' }
)

foreach ($p in $products) {
  $proofHtml = if ($p.Image) {
@"
      <article class="product-proof-card">
        <figure class="product-proof-media">
          <img src="$($p.Image)" alt="$($p.ImageAlt)">
        </figure>
        <p class="help">실제 취급 품목과 관련된 저장소 내 이미지를 참고용으로 사용했습니다.</p>
      </article>
"@
  } else {
@"
      <article class="product-proof-card text-only">
        <div class="badges"><span class="badge strong">맞춤 상담 품목</span><span class="badge warm">세부 규격 확인 후 진행</span></div>
        <h2 class="section-title">실제 사양 확인 후 안내합니다.</h2>
        <p>세부 규격이 정해지지 않은 상담 품목으로, 필요한 사양을 확인한 뒤 견적을 안내합니다.</p>
        <p class="help">규격, 수량, 사용 용도를 알려주시면 진행 가능 범위를 확인해 안내합니다.</p>
      </article>
"@
  }

  $calcHtml = if ($p.Calc) {
@"
        <div class="field" data-quote-calc data-unit-price="$($p.Calc)">
          <label for="qty">예상 수량</label>
          <select id="qty" data-quote-qty>
            <option value="10">10개</option>
            <option value="50">50개</option>
            <option value="300">300개</option>
            <option value="500">500개</option>
            <option value="1000">1000개</option>
          </select>
          <div class="field-help">단순 참고용 계산이며, 실제 견적은 사양 확인 후 안내합니다.</div>
          <input data-quote-total value="" readonly>
        </div>
"@
  } else {
        '<p class="help">맞춤 상담 품목은 규격과 수량 확인 후 개별 견적을 안내합니다.</p>'
  }

  $main = @"
<section class="section">
  <div class="container page-hero">
    <div>
      <div class="breadcrumb"><a href="index.html">홈</a> / <a href="products.html">상품안내</a> / $($p.Title)</div>
      <h1 class="page-title">$($p.Title)</h1>
      <div class="badges" style="margin-top:14px;">
        <span class="badge strong">$($p.Category)</span>
        <span class="badge">코드 $($p.Code)</span>
        <span class="badge">리드타임 $($p.Lead)</span>
      </div>
    </div>
    <div class="product-hero-grid">
$proofHtml
      <aside class="product-summary-card">
        <div>
          <div class="product-summary-title">요약 정보</div>
          <div class="help">규격, 재질, 수량, 납품 방식에 따라 실제 견적과 일정은 달라질 수 있습니다.</div>
        </div>
        <div class="summary-list">
          <div class="summary-item full"><div class="summary-label">규격</div><div class="summary-value">$($p.Spec)</div></div>
          <div class="summary-item full"><div class="summary-label">재질 · 골 · 두께</div><div class="summary-value">$($p.Material)</div></div>
          <div class="summary-item"><div class="summary-label">단가</div><div class="summary-value">$($p.Price)</div></div>
          <div class="summary-item"><div class="summary-label">최소수량</div><div class="summary-value">$($p.Min)</div></div>
          <div class="summary-item full"><div class="summary-label">리드타임</div><div class="summary-value">$($p.Lead)</div></div>
        </div>
$calcHtml
        <div class="cta-row">
          <a class="btn primary" href="quote.html">맞춤견적 요청</a>
          <a class="btn" href="shipping.html">거래안내</a>
        </div>
      </aside>
    </div>
    <nav class="product-tabs" aria-label="상품 상세 메뉴">
      <a href="#detail-info">기본 사양</a>
      <a href="#shipping-guide">구매/배송 안내</a>
      <a href="#tax-guide">세금계산서</a>
      <a href="#inquiry-guide">문의</a>
    </nav>
    <section id="detail-info" class="detail-section">
      <h2>기본 사양</h2>
      <div class="spec-grid">
        <div class="card"><div class="summary-label">상품명</div><div class="summary-value">$($p.Title)</div></div>
        <div class="card"><div class="summary-label">코드</div><div class="summary-value">$($p.Code)</div></div>
        <div class="card"><div class="summary-label">규격</div><div class="summary-value">$($p.Spec)</div></div>
        <div class="card"><div class="summary-label">재질 · 골 · 두께</div><div class="summary-value">$($p.Material)</div></div>
      </div>
    </section>
    <section id="shipping-guide" class="detail-section">
      <h2>구매 / 배송 안내</h2>
      <ul class="detail-list">
        <li>주문 전 규격, 수량, 납품 방식을 확인한 뒤 견적을 안내합니다.</li>
        <li>배송은 택배, 퀵, 방문수령 중 가능한 방식으로 안내합니다.</li>
        <li>배송비는 기본 착불이며, 품목과 지역에 따라 달라질 수 있습니다.</li>
        <li>카드 결제는 지원하지 않습니다.</li>
      </ul>
      <div class="cta-row"><a class="btn" href="shipping.html">거래안내 보기</a></div>
    </section>
    <section id="tax-guide" class="detail-section">
      <h2>세금계산서</h2>
      <p>세금계산서는 필요 자료를 확인한 뒤 발행 가능합니다. 자세한 기준은 안내 페이지에서 확인하실 수 있습니다.</p>
      <div class="cta-row"><a class="btn" href="tax.html">세금계산서 안내</a></div>
    </section>
    <section id="inquiry-guide" class="detail-section">
      <h2>문의</h2>
      <p>세부 사양이 정리되지 않았더라도 먼저 문의해 주시면 확인 가능한 범위에서 안내드립니다.</p>
      <div class="cta-row">
        <a class="btn primary" href="quote.html">맞춤견적 요청</a>
        <a class="btn" href="contact.html">문의/오시는 길</a>
      </div>
    </section>
  </div>
</section>
"@

  Write-Page $p.File $p.Title $p.Desc 'products' 'product-detail-page' $main ($(if ($p.Image) { $p.Image } else { 'assets/images/home/storefront-hero.jpg' }))
}
