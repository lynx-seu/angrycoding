<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:f="front-end-compiler"
	xmlns:html="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:saxon="http://saxon.sf.net/"
	xmlns:xsr="/xsr.XSRElementFactory"
	extension-element-prefixes="saxon xsr"
	exclude-result-prefixes="#all">

	<!-- strip whitespace from output HTML -->

	<xsl:strip-space elements="*" />

	<!-- replace entities -->

	<xsl:character-map name="html-disable-escaping">
		<xsl:output-character character="&#60;" string="&lt;" />
		<xsl:output-character character="&#62;" string="&gt;" />
		<xsl:output-character character="&#38;" string="&amp;" />
	</xsl:character-map>

	<!-- set output settings -->

	<xsl:output
		method="html"
		indent="no"
		doctype-public="-//W3C//DTD HTML 4.01//EN"
		doctype-system="http://www.w3.org/TR/html4/strict.dtd"
		use-character-maps="html-disable-escaping"
		omit-xml-declaration="yes"
	/>

	<!-- compresses javascript using google closure compiler -->

	<xsl:function name="f:compress-javascript">
		<xsl:param name="javascript-code" />
		<xsr:script>
			<xsr:with-param name="javascript-code" select="$javascript-code" />
			<xsr:body><![CDATA[
				var jsCompiler = JavaImporter(com.google.javascript.jscomp);
				var jsCompilerOptions = new jsCompiler.CompilerOptions();
				// SIMPLE_OPTIMIZATIONS
				//ADVANCED_OPTIMIZATIONS
				jsCompiler.CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(
					jsCompilerOptions
				);
				var jsSourceFilefromCode = (
					java.lang.Class.forName('com.google.javascript.jscomp.JSSourceFile').
					getMethod('fromCode', [java.lang.String,java.lang.String])
				);
				var jsCompilerExtern = jsSourceFilefromCode.invoke(null,[
					"externs.js", "function alert(x) {}"
				]);
				var jsCompilerInput = jsSourceFilefromCode.invoke(null,[
					"input.js", getParam('javascript-code')
				]);
				var compiler = new Packages.com.google.javascript.jscomp.Compiler(Packages.java.lang.System.err);
				compiler.compile(jsCompilerExtern, jsCompilerInput, jsCompilerOptions);
				characters(compiler.toSource());
			]]></xsr:body>
		</xsr:script>
	</xsl:function>

	<!-- compresses css using ... -->

	<xsl:function name="f:compress-css">
		<xsl:param name="css-code" />
		<xsr:script>
			<xsr:with-param name="css-code" select="$css-code" />
			<xsr:body><![CDATA[
				var cssParser = new CSSParser();
				cssParser.parseData(getParam('css-code'));
				var selectors = cssParser.styles;
				var compressedSelectors = [];
				for (var i = 0; i < selectors.length; i++) {
					var properties = selectors[i].selectors;
					for (var j = 0; j < properties.length; j++) {
						var selectorName = properties[j].data;
						var selectorProps = properties[j].properties.values;
						var compressedProps = '';
						for (var propName in selectorProps) {
							propName = propName.toLowerCase();
							var propValue = selectorProps[propName];
							compressedProps += ([propName, propValue].join(':') + ';');
						}
						compressedSelectors.push(selectorName + '{' + compressedProps + '}');
					}
				}
				characters(compressedSelectors.join(''));
			]]></xsr:body>
		</xsr:script>
	</xsl:function>

	<!-- main entry point -->

	<xsl:template name="main">

		<!-- include css parser -->
		<xsr:script href="lib/js/css-parser.js" />

		<!-- parse input document -->
		<xsl:variable name="document" select="document('../src/index.html')" />
		<xsl:variable name="base-uri" select="document-uri($document)" />

		<xsl:call-template name="optimize">
			<xsl:with-param name="base-uri" select="$base-uri" />
			<xsl:with-param name="context">
				<xsl:for-each select="$document">
					<xsl:apply-templates mode="inline">
						<xsl:with-param name="base-uri" select="$base-uri" />
					</xsl:apply-templates>
				</xsl:for-each>
			</xsl:with-param>
		</xsl:call-template>

	</xsl:template>

	<xsl:template name="optimize">
		<xsl:param name="base-uri" />
		<xsl:param name="context" />
		<xsl:for-each-group select="$context/*" group-by="local-name()">
			<xsl:variable name="local-name" select="current-grouping-key()" />
			<xsl:choose>
				<xsl:when test="$local-name = 'script' and count(current-group()) &gt; 1">
					<script type="text/javascript">
						<xsl:value-of select="f:compress-javascript(
							string-join(current-group()/text(), '')
						)" />
					</script>
				</xsl:when>
				<xsl:when test="$local-name = 'style' and count(current-group()) &gt; 1">
					<style type="text/css">
						<xsl:value-of select="f:compress-css(
							string-join(current-group()/text(), '')
						)" />
					</style>
				</xsl:when>
				<xsl:otherwise>
					<xsl:for-each select="current-group()">
						<xsl:copy>
							<xsl:copy-of select="@* | text()" />
							<xsl:call-template name="optimize">
								<xsl:with-param name="base-uri" select="$base-uri" />
								<xsl:with-param name="context" select="current()" />
							</xsl:call-template>
						</xsl:copy>
					</xsl:for-each>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each-group>
	</xsl:template>

	<xsl:template match="@* | text() | node()" mode="inline">
		<xsl:param name="base-uri" />
		<xsl:copy>
			<xsl:apply-templates select="@* | text() | node()" mode="inline">
				<xsl:with-param name="base-uri" select="$base-uri" />
			</xsl:apply-templates>
		</xsl:copy>
	</xsl:template>

	<!-- inlines external stylesheets -->

	<xsl:template match="html:link[@type='text/css' and @href]" mode="inline">
		<xsl:param name="base-uri" />
		<style type="text/css">
			<xsl:value-of select="unparsed-text(resolve-uri(@href, $base-uri))" />
		</style>
	</xsl:template>

	<!-- inlines external javascript files -->

	<xsl:template match="html:script[@type = 'text/javascript' and @src]" mode="inline">
		<xsl:param name="base-uri" />
		<script type="text/javascript">
			<xsl:value-of select="unparsed-text(resolve-uri(@src, $base-uri))" />
		</script>
	</xsl:template>

</xsl:stylesheet>