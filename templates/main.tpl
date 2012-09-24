<!DOCTYPE HTML>
<html>
	<head>
		<title>Система самообслуживания</title>
		<link rel="stylesheet" type="text/css" href="style/stylesheet.css" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<script type="text/javascript" src="script/jquery.js"></script>
		<script type="text/javascript" src="script/jquery.easing.1.3.js"></script>
		<script type="text/javascript" src="script/main.js"></script>
		<script type="text/javascript" src="script/packer.js"></script>
	</head>
	<body>

		{{var rows = this.rows}}
		{{var cols = this.cols}}
		{{var gadgetWidth = this.gadget.width}}
		{{var gadgetHeight = this.gadget.height}}
		{{var gadgetSpacing = this.gadget.spacing}}

		<div class="gadget-window">
			<div class="wrapper">
				<div class="gadget-window-pointer gadget-window-pointer-top"></div>
			</div>
			<div class="gadget-window-outer-wrapper">
				<div class="gadget-window-border"></div>
				<div class="gadget-window-inner-wrapper">
					<div class="wrapper">
						<div class="gadget-window-content">
							«МегаФон» представляет новинку – Wi-Fi-роутер, способный обеспечить работу до 20 пользователей (устройств) одновременно. Главное преимущество этого гаджета – возможность подключиться к скоростному Интернету 4G (новое устройство совместимо с 4G-модемами «МегаФона»).
							Роутер «МегаФон R1 LTE» в сочетании с 4G-модемом позволяет подключить к Интернету на скорости до 50 Мбит/сек сразу несколько мобильных устройств или пользователей в зоне действия 4G от «МегаФона». Кроме того, это универсальное устройство совместимо с модемами 3G, а также способно транслировать через Wi-Fi сигнал проводного Интернета (имеет WAN-интерфейс).
							«Развивая сети четвертого поколения в регионах России, «МегаФон» стремится обеспечить клиентов инновационными средствами доступа к Интернету, чтобы получить от новой технологии максимальную отдачу. Новый роутер из их числа. С помощью 4G-модема, всего одной SIM-карты «МегаФона» и нового роутера можно одновременно подключать к скоростному Интернету планшеты, смартфоны и другие мобильные устройства, даже если они не поддерживают 4G. Это оптимальное решение для владельцев нескольких гаджетов или коллективных пользователей, в том числе для компаний малого и среднего бизнеса», — говорит Михаил Дубин, заместитель генерального директора ОАО «МегаФон».
							Продажи нового устройства стартуют в Москве в середине сентября, в дальнейшем будут организованы поставки и в другие регионы России, где развернуты сети 4G. В салонах оператора роутер «МегаФон R1 LTE» будет доступен по цене 2990 рублей. Предзаказ устройства организован через московский Интернет-магазин «МегаФона».
							Сегодня «МегаФон» обеспечивает клиентам доступ к скоростному Интернету по технологии LTE в Москве и ряде городов Московской области, Санкт-Петербурге, Новосибирске, Самаре, Казани, Краснодаре, Сочи, а также во Владивостоке. Сети 4G уже развернуты на территории, где проживает более 20% населения страны – до конца 2012 года за счет появления новых сетей этот показатель приблизится к 30%.
						</div>
				</div></div>
			</div>
			<div class="wrapper">
				<div class="gadget-window-pointer gadget-window-pointer-bottom"></div>
			</div>
		</div>

		<div class="gadget-board" data-settings='{{this.toJSON()}}'
			style="width: {{cols * gadgetWidth + (cols - 1)* gadgetSpacing}}px;">

			<div class="header">
				<a href="/">
					<img src="media/logo.png" />
				</a>
			</div>
			<ul class="menu">
				{{for container in this.containers}}
					<li data-name="{{container.name}}" class="{{[
						'menu-item', self.index is 0 ? 'menu-item-active'
					]}}">{{container.title}}
				{{/for}}
			</ul>

			{{for container in this.containers}}
				{{var packed = pack(cols, rows, container.gadgets)}}
				<div style="height: {{packed.height * gadgetHeight + (packed.height - 1) * gadgetSpacing}}px;"
					class="{{['gadget-container', 'gadget-container-' + container.name, self.index is 0 ? 'gadget-container-active']}}">
					{{for gadget in packed.items}}
						{{var top = gadget.top}}
						{{var left = gadget.left}}
						{{var width = gadget.width}}
						{{var height = gadget.height}}
						<div id="{{gadget.id}}" class="{{['gadget',
							'gadget-row-' + range(top, top + height - 1).join(' gadget-row-'),
							'gadget-cell-' + range(left, left + width - 1).join(' gadget-cell-')
						]}}" data-settings='{{gadget.toJSON()}}' style="
							top: {{top * gadgetHeight + top * gadgetSpacing}}px;
							left: {{left * gadgetWidth + left * gadgetSpacing}}px;
							width: {{gadgetWidth * width + (width - 1) * gadgetSpacing}}px;
							height: {{gadgetHeight * height + (height - 1) * gadgetSpacing}}px;
						">
							<div style="padding: 10px;">
								{{loadText(gadget.url)}}
							</div>
						</div>
					{{/for}}
				</div>
			{{/for}}

			<div class="footer"></div>

		</div>

	</body>
</html>