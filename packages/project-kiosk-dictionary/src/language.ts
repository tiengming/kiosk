/**
 * Languages have been taken from here:
 * https://www.loc.gov/standards/iso639-2/ascii_8bits.html
 */
const languages = [
	{ alpha3: 'aar', alpha2: 'aa', name: 'Afar' },
	{ alpha3: 'abk', alpha2: 'ab', name: 'Abkhazian' },
	{ alpha3: 'afr', alpha2: 'af', name: 'Afrikaans' },
	{ alpha3: 'aka', alpha2: 'ak', name: 'Akan' },
	{ alpha3: 'alb', alpha2: 'sq', name: 'Albanian' },
	{ alpha3: 'amh', alpha2: 'am', name: 'Amharic' },
	{ alpha3: 'ara', alpha2: 'ar', name: 'Arabic' },
	{ alpha3: 'arg', alpha2: 'an', name: 'Aragonese' },
	{ alpha3: 'arm', alpha2: 'hy', name: 'Armenian' },
	{ alpha3: 'asm', alpha2: 'as', name: 'Assamese' },
	{ alpha3: 'ava', alpha2: 'av', name: 'Avaric' },
	{ alpha3: 'ave', alpha2: 'ae', name: 'Avestan' },
	{ alpha3: 'aym', alpha2: 'ay', name: 'Aymara' },
	{ alpha3: 'aze', alpha2: 'az', name: 'Azerbaijani' },
	{ alpha3: 'bak', alpha2: 'ba', name: 'Bashkir' },
	{ alpha3: 'bam', alpha2: 'bm', name: 'Bambara' },
	{ alpha3: 'baq', alpha2: 'eu', name: 'Basque' },
	{ alpha3: 'bel', alpha2: 'be', name: 'Belarusian' },
	{ alpha3: 'ben', alpha2: 'bn', name: 'Bengali' },
	{ alpha3: 'bih', alpha2: 'bh', name: 'Bihari languages' },
	{ alpha3: 'bis', alpha2: 'bi', name: 'Bislama' },
	{ alpha3: 'bos', alpha2: 'bs', name: 'Bosnian' },
	{ alpha3: 'bre', alpha2: 'br', name: 'Breton' },
	{ alpha3: 'bul', alpha2: 'bg', name: 'Bulgarian' },
	{ alpha3: 'bur', alpha2: 'my', name: 'Burmese' },
	{ alpha3: 'cat', alpha2: 'ca', name: 'Catalan' },
	{ alpha3: 'cha', alpha2: 'ch', name: 'Chamorro' },
	{ alpha3: 'che', alpha2: 'ce', name: 'Chechen' },
	{ alpha3: 'chi', alpha2: 'zh', name: 'Chinese' },
	{ alpha3: 'chu', alpha2: 'cu', name: 'Church Slavic' },
	{ alpha3: 'chv', alpha2: 'cv', name: 'Chuvash' },
	{ alpha3: 'cor', alpha2: 'kw', name: 'Cornish' },
	{ alpha3: 'cos', alpha2: 'co', name: 'Corsican' },
	{ alpha3: 'cre', alpha2: 'cr', name: 'Cree' },
	{ alpha3: 'cze', alpha2: 'cs', name: 'Czech' },
	{ alpha3: 'dan', alpha2: 'da', name: 'Danish' },
	{ alpha3: 'div', alpha2: 'dv', name: 'Maldivian' },
	{ alpha3: 'dut', alpha2: 'nl', name: 'Dutch' },
	{ alpha3: 'dzo', alpha2: 'dz', name: 'Dzongkha' },
	{ alpha3: 'eng', alpha2: 'en', name: 'English' },
	{ alpha3: 'epo', alpha2: 'eo', name: 'Esperanto' },
	{ alpha3: 'est', alpha2: 'et', name: 'Estonian' },
	{ alpha3: 'ewe', alpha2: 'ee', name: 'Ewe' },
	{ alpha3: 'fao', alpha2: 'fo', name: 'Faroese' },
	{ alpha3: 'fij', alpha2: 'fj', name: 'Fijian' },
	{ alpha3: 'fin', alpha2: 'fi', name: 'Finnish' },
	{ alpha3: 'fre', alpha2: 'fr', name: 'French' },
	{ alpha3: 'fry', alpha2: 'fy', name: 'Western Frisian' },
	{ alpha3: 'ful', alpha2: 'ff', name: 'Fulah' },
	{ alpha3: 'geo', alpha2: 'ka', name: 'Georgian' },
	{ alpha3: 'ger', alpha2: 'de', name: 'German' },
	{ alpha3: 'gla', alpha2: 'gd', name: 'Scottish Gaelic' },
	{ alpha3: 'gle', alpha2: 'ga', name: 'Irish' },
	{ alpha3: 'glg', alpha2: 'gl', name: 'Galician' },
	{ alpha3: 'glv', alpha2: 'gv', name: 'Manx' },
	{ alpha3: 'gre', alpha2: 'el', name: 'Greek, Modern (1453-)' },
	{ alpha3: 'grn', alpha2: 'gn', name: 'Guarani' },
	{ alpha3: 'guj', alpha2: 'gu', name: 'Gujarati' },
	{ alpha3: 'hat', alpha2: 'ht', name: 'Haitian Creole' },
	{ alpha3: 'hau', alpha2: 'ha', name: 'Hausa' },
	{ alpha3: 'heb', alpha2: 'he', name: 'Hebrew' },
	{ alpha3: 'her', alpha2: 'hz', name: 'Herero' },
	{ alpha3: 'hin', alpha2: 'hi', name: 'Hindi' },
	{ alpha3: 'hmo', alpha2: 'ho', name: 'Hiri Motu' },
	{ alpha3: 'hrv', alpha2: 'hr', name: 'Croatian' },
	{ alpha3: 'hun', alpha2: 'hu', name: 'Hungarian' },
	{ alpha3: 'ibo', alpha2: 'ig', name: 'Igbo' },
	{ alpha3: 'ice', alpha2: 'is', name: 'Icelandic' },
	{ alpha3: 'ido', alpha2: 'io', name: 'Ido' },
	{ alpha3: 'iii', alpha2: 'ii', name: 'Sichuan Yi' },
	{ alpha3: 'iku', alpha2: 'iu', name: 'Inuktitut' },
	{ alpha3: 'ile', alpha2: 'ie', name: 'Interlingue; Occidental' },
	{ alpha3: 'ina', alpha2: 'ia', name: 'Interlingua' },
	{ alpha3: 'ind', alpha2: 'id', name: 'Indonesian' },
	{ alpha3: 'ipk', alpha2: 'ik', name: 'Inupiaq' },
	{ alpha3: 'ita', alpha2: 'it', name: 'Italian' },
	{ alpha3: 'jav', alpha2: 'jv', name: 'Javanese' },
	{ alpha3: 'jpn', alpha2: 'ja', name: 'Japanese' },
	{ alpha3: 'kal', alpha2: 'kl', name: 'Greenlandic' },
	{ alpha3: 'kan', alpha2: 'kn', name: 'Kannada' },
	{ alpha3: 'kas', alpha2: 'ks', name: 'Kashmiri' },
	{ alpha3: 'kau', alpha2: 'kr', name: 'Kanuri' },
	{ alpha3: 'kaz', alpha2: 'kk', name: 'Kazakh' },
	{ alpha3: 'khm', alpha2: 'km', name: 'Central Khmer' },
	{ alpha3: 'kik', alpha2: 'ki', name: 'Kikuyu' },
	{ alpha3: 'kin', alpha2: 'rw', name: 'Kinyarwanda' },
	{ alpha3: 'kir', alpha2: 'ky', name: 'Kirghiz' },
	{ alpha3: 'kom', alpha2: 'kv', name: 'Komi' },
	{ alpha3: 'kon', alpha2: 'kg', name: 'Kongo' },
	{ alpha3: 'kor', alpha2: 'ko', name: 'Korean' },
	{ alpha3: 'kua', alpha2: 'kj', name: 'Kuanyama' },
	{ alpha3: 'kur', alpha2: 'ku', name: 'Kurdish' },
	{ alpha3: 'lao', alpha2: 'lo', name: 'Lao' },
	{ alpha3: 'lat', alpha2: 'la', name: 'Latin' },
	{ alpha3: 'lav', alpha2: 'lv', name: 'Latvian' },
	{ alpha3: 'lim', alpha2: 'li', name: 'Limburgan' },
	{ alpha3: 'lin', alpha2: 'ln', name: 'Lingala' },
	{ alpha3: 'lit', alpha2: 'lt', name: 'Lithuanian' },
	{ alpha3: 'ltz', alpha2: 'lb', name: 'Luxembourgish' },
	{ alpha3: 'lub', alpha2: 'lu', name: 'Luba-Katanga' },
	{ alpha3: 'lug', alpha2: 'lg', name: 'Ganda' },
	{ alpha3: 'mac', alpha2: 'mk', name: 'Macedonian' },
	{ alpha3: 'mah', alpha2: 'mh', name: 'Marshallese' },
	{ alpha3: 'mal', alpha2: 'ml', name: 'Malayalam' },
	{ alpha3: 'mao', alpha2: 'mi', name: 'Maori' },
	{ alpha3: 'mar', alpha2: 'mr', name: 'Marathi' },
	{ alpha3: 'may', alpha2: 'ms', name: 'Malay' },
	{ alpha3: 'mlg', alpha2: 'mg', name: 'Malagasy' },
	{ alpha3: 'mlt', alpha2: 'mt', name: 'Maltese' },
	{ alpha3: 'mon', alpha2: 'mn', name: 'Mongolian' },
	{ alpha3: 'nau', alpha2: 'na', name: 'Nauru' },
	{ alpha3: 'nav', alpha2: 'nv', name: 'Navajo' },
	{ alpha3: 'nbl', alpha2: 'nr', name: 'South Ndebele' },
	{ alpha3: 'nde', alpha2: 'nd', name: 'North Ndebele' },
	{ alpha3: 'ndo', alpha2: 'ng', name: 'Ndonga' },
	{ alpha3: 'nep', alpha2: 'ne', name: 'Nepali' },
	{ alpha3: 'nno', alpha2: 'nn', name: 'Norwegian Nynorsk' },
	{ alpha3: 'nob', alpha2: 'nb', name: 'Norwegian Bokmål' },
	{ alpha3: 'nor', alpha2: 'no', name: 'Norwegian' },
	{ alpha3: 'nya', alpha2: 'ny', name: 'Chichewa' },
	{ alpha3: 'oci', alpha2: 'oc', name: 'Occitan (post 1500)' },
	{ alpha3: 'oji', alpha2: 'oj', name: 'Ojibwa' },
	{ alpha3: 'ori', alpha2: 'or', name: 'Oriya' },
	{ alpha3: 'orm', alpha2: 'om', name: 'Oromo' },
	{ alpha3: 'oss', alpha2: 'os', name: 'Ossetic' },
	{ alpha3: 'pan', alpha2: 'pa', name: 'Punjabi' },
	{ alpha3: 'per', alpha2: 'fa', name: 'Persian' },
	{ alpha3: 'pli', alpha2: 'pi', name: 'Pali' },
	{ alpha3: 'pol', alpha2: 'pl', name: 'Polish' },
	{ alpha3: 'por', alpha2: 'pt', name: 'Portuguese' },
	{ alpha3: 'pus', alpha2: 'ps', name: 'Pashto' },
	{ alpha3: 'que', alpha2: 'qu', name: 'Quechua' },
	{ alpha3: 'roh', alpha2: 'rm', name: 'Romansh' },
	{ alpha3: 'rum', alpha2: 'ro', name: 'Romanian' },
	{ alpha3: 'run', alpha2: 'rn', name: 'Rundi' },
	{ alpha3: 'rus', alpha2: 'ru', name: 'Russian' },
	{ alpha3: 'sag', alpha2: 'sg', name: 'Sango' },
	{ alpha3: 'san', alpha2: 'sa', name: 'Sanskrit' },
	{ alpha3: 'sin', alpha2: 'si', name: 'Sinhalese' },
	{ alpha3: 'slo', alpha2: 'sk', name: 'Slovak' },
	{ alpha3: 'slv', alpha2: 'sl', name: 'Slovenian' },
	{ alpha3: 'sme', alpha2: 'se', name: 'Northern Sami' },
	{ alpha3: 'smo', alpha2: 'sm', name: 'Samoan' },
	{ alpha3: 'sna', alpha2: 'sn', name: 'Shona' },
	{ alpha3: 'snd', alpha2: 'sd', name: 'Sindhi' },
	{ alpha3: 'som', alpha2: 'so', name: 'Somali' },
	{ alpha3: 'sot', alpha2: 'st', name: 'Sotho, Southern' },
	{ alpha3: 'spa', alpha2: 'es', name: 'Castilian' },
	{ alpha3: 'srd', alpha2: 'sc', name: 'Sardinian' },
	{ alpha3: 'srp', alpha2: 'sr', name: 'Serbian' },
	{ alpha3: 'ssw', alpha2: 'ss', name: 'Swati' },
	{ alpha3: 'sun', alpha2: 'su', name: 'Sundanese' },
	{ alpha3: 'swa', alpha2: 'sw', name: 'Swahili' },
	{ alpha3: 'swe', alpha2: 'sv', name: 'Swedish' },
	{ alpha3: 'tah', alpha2: 'ty', name: 'Tahitian' },
	{ alpha3: 'tam', alpha2: 'ta', name: 'Tamil' },
	{ alpha3: 'tat', alpha2: 'tt', name: 'Tatar' },
	{ alpha3: 'tel', alpha2: 'te', name: 'Telugu' },
	{ alpha3: 'tgk', alpha2: 'tg', name: 'Tajik' },
	{ alpha3: 'tgl', alpha2: 'tl', name: 'Tagalog' },
	{ alpha3: 'tha', alpha2: 'th', name: 'Thai' },
	{ alpha3: 'tib', alpha2: 'bo', name: 'Tibetan' },
	{ alpha3: 'tir', alpha2: 'ti', name: 'Tigrinya' },
	{ alpha3: 'ton', alpha2: 'to', name: 'Tonga (Tonga Islands)' },
	{ alpha3: 'tsn', alpha2: 'tn', name: 'Tswana' },
	{ alpha3: 'tso', alpha2: 'ts', name: 'Tsonga' },
	{ alpha3: 'tuk', alpha2: 'tk', name: 'Turkmen' },
	{ alpha3: 'tur', alpha2: 'tr', name: 'Turkish' },
	{ alpha3: 'twi', alpha2: 'tw', name: 'Twi' },
	{ alpha3: 'uig', alpha2: 'ug', name: 'Uyghur' },
	{ alpha3: 'ukr', alpha2: 'uk', name: 'Ukrainian' },
	{ alpha3: 'urd', alpha2: 'ur', name: 'Urdu' },
	{ alpha3: 'uzb', alpha2: 'uz', name: 'Uzbek' },
	{ alpha3: 'ven', alpha2: 've', name: 'Venda' },
	{ alpha3: 'vie', alpha2: 'vi', name: 'Vietnamese' },
	{ alpha3: 'vol', alpha2: 'vo', name: 'Volapük' },
	{ alpha3: 'wel', alpha2: 'cy', name: 'Welsh' },
	{ alpha3: 'wln', alpha2: 'wa', name: 'Walloon' },
	{ alpha3: 'wol', alpha2: 'wo', name: 'Wolof' },
	{ alpha3: 'xho', alpha2: 'xh', name: 'Xhosa' },
	{ alpha3: 'yid', alpha2: 'yi', name: 'Yiddish' },
	{ alpha3: 'yor', alpha2: 'yo', name: 'Yoruba' },
	{ alpha3: 'zha', alpha2: 'za', name: 'Chuang' },
	{ alpha3: 'zul', alpha2: 'zu', name: 'Zulu' }
] as const;

export type Language = (typeof languages)[number];
export type LanguageName<L extends Language = Language> = L['name'];
export type Alpha2Code<L extends Language = Language> = L['alpha2'];
export type Alpha3Code<L extends Language = Language> = L['alpha3'];

export function getLanguageByAlpha2Code<L extends Language, T extends Alpha2Code<L>>(
	code: T
): L | undefined {
	return languages.find((language): language is L => language.alpha2 === code);
}

export function getLanguageByAlpha3Code<L extends Language, T extends Alpha3Code<L>>(
	code: T
): L | undefined {
	return languages.find((language): language is L => language.alpha3 === code);
}

export function getLanguageByName<L extends Language, T extends LanguageName<L>>(
	name: T
): L | undefined {
	return languages.find(
		(language): language is L => language.name.toLowerCase() === name.toLowerCase()
	);
}