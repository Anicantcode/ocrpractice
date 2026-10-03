import re
from typing import Optional

# 1. Factory Vocabulary Dictionary (Industrial / Warehouse domain)
# Mapped specifically for Morde Foods Factory & Warehouses
FACTORY_LEXICON = {
    # Actions & Operations
    "लोडींग": "Loading",
    "लोडिंग": "Loading",
    "अनलोडींग": "Unloading",
    "अनलोडिंग": "Unloading",
    "करणे": "",
    "हँडलिंग": "Handling",
    "ट्रान्सफर": "Transfer",
    
    # Locations
    "परिसर": "Yard",
    "कंपनी": "Company",
    "गोडाऊन": "Godown",
    "काळे": "Kale",
    "काळे गोडाऊन": "Kale Godown",
    "टोटन": "Totan",
    "कोको": "Coco",
    
    # Materials, Packaging & Work Units
    "गाड्यांमधी": "Inside vehicles",
    "गाड्यांमध्ये": "Inside vehicles",
    "गाडी": "Vehicle",
    "गाड्या": "Vehicles",
    "पॅलेट्स": "Pallets",
    "पॅलेट": "Pallet",
    "थापी": "Stack",
    "लाकडी": "Wooden",
    "पट्टा": "Belt",
    "पैकी": "of",
    "कामावर": "On task",
    "कामाश": "Work",
    "काम": "Work",
    "तपशील": "Detail",
    "दर": "Rate",
    "शेरा": "Remark",
    "शिफ्ट": "Shift",
    "गँग लीडर": "Gang Leader",
    "नाव": "Name",
    "दिनांक": "Date",
    "क्र": "No",
    "क्रमांक": "Number",
    
    # Common Worker & Leader Names
    "संतोष पोपटकर": "Santosh Popatkar",
    "संतोष": "Santosh",
    "पोपटकर": "Popatkar",
    "राजेश पाटील": "Rajesh Patil",
    "राजेश": "Rajesh",
    "पाटील": "Patil",
    "अमित": "Amit",
    "सचिन": "Sachin",
    "सुनील": "Sunil",
    "गणेश": "Ganesh"
}

# Devanagari to standard digits
DEVANAGARI_DIGITS = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

# Basic phonetic transliteration for Devanagari when not in lexicon
DEVA_CONSONANTS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l', 'क्ष': 'ksh', 'ज्ञ': 'dny'
}

DEVA_VOWELS = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ऋ': 'ru', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah'
}

DEVA_MATRAS = {
    'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
    'ृ': 'ru', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': ''
}

def contains_devanagari(text: str) -> bool:
    """Checks if text contains any Devanagari unicode characters."""
    return bool(re.search(r'[\u0900-\u097F]', text))

def convert_devanagari_digits(text: str) -> str:
    """Converts Devanagari numerals (०-९) to ASCII digits (0-9)."""
    return "".join(DEVANAGARI_DIGITS.get(ch, ch) for ch in text)

def transliterate_devanagari_word(word: str) -> str:
    """Fallback phonetic transliteration for unknown Devanagari proper nouns."""
    chars = list(word)
    out = []
    i = 0
    n = len(chars)
    while i < n:
        ch = chars[i]
        if ch in DEVA_VOWELS:
            out.append(DEVA_VOWELS[ch])
            i += 1
        elif ch in DEVA_CONSONANTS:
            base = DEVA_CONSONANTS[ch]
            # Check next char for matra or virama
            if i + 1 < n and chars[i + 1] in DEVA_MATRAS:
                matra = DEVA_MATRAS[chars[i + 1]]
                out.append(base + matra)
                i += 2
            else:
                # Default inherent 'a' sound unless at end of word
                if i + 1 < n and chars[i + 1] in DEVA_CONSONANTS:
                    out.append(base + 'a')
                else:
                    out.append(base)
                i += 1
        elif ch in DEVA_MATRAS:
            out.append(DEVA_MATRAS[ch])
            i += 1
        else:
            out.append(ch)
            i += 1
    res = "".join(out).strip()
    return res.capitalize() if res else ""

def translate_marathi_mixed(text: str) -> str:
    """
    Translates mixed Marathi-English strings cleanly.
    - Preserves all existing English words (e.g. 'Pallets', 'Unloading', 'godon TO ES').
    - Translates factory Devanagari terms with 100% domain precision.
    - Converts Marathi numerals to ASCII digits.
    - Transliterates any unknown Devanagari names.
    """
    if not text:
        return ""
    
    # First, convert any Devanagari digits
    text = convert_devanagari_digits(text)
    
    # If no Devanagari remaining, return normalized string
    if not contains_devanagari(text):
        normalized = text.strip()
        normalized = re.sub(r'\bgodon\b', 'Godown', normalized, flags=re.IGNORECASE)
        normalized = re.sub(r'\bTO\s+ES\b', 'TO ES', normalized, flags=re.IGNORECASE)
        return normalized
    
    # Multi-word phrase matches from factory lexicon first
    working_text = text
    for phrase, eng in sorted(FACTORY_LEXICON.items(), key=lambda x: -len(x[0])):
        if " " in phrase and phrase in working_text:
            working_text = working_text.replace(phrase, f" {eng} ")

    # Tokenize word-by-word
    tokens = re.split(r'(\s+|[,\-\/]+)', working_text)
    translated_tokens = []

    for t in tokens:
        stripped = t.strip()
        if not stripped:
            translated_tokens.append(t)
            continue
        
        # Exact lexicon match
        if stripped in FACTORY_LEXICON:
            eng_val = FACTORY_LEXICON[stripped]
            if eng_val:  # Non-empty
                translated_tokens.append(eng_val)
        elif contains_devanagari(stripped):
            # Clean punctuation around devanagari word
            clean_word = re.sub(r'[^\u0900-\u097F]', '', stripped)
            prefix = re.match(r'^[^\u0900-\u097F]*', stripped).group(0)
            suffix = re.search(r'[^\u0900-\u097F]*$', stripped).group(0)
            
            if clean_word in FACTORY_LEXICON:
                trans = FACTORY_LEXICON[clean_word]
                if trans:
                    translated_tokens.append(f"{prefix}{trans}{suffix}")
            else:
                # Transliterate unknown Devanagari word
                phonetic = transliterate_devanagari_word(clean_word)
                translated_tokens.append(f"{prefix}{phonetic}{suffix}")
        else:
            # Already English / number / punctuation - preserve exactly!
            translated_tokens.append(t)

    # Clean up whitespace
    result = "".join(translated_tokens)
    result = re.sub(r'\s+', ' ', result).strip()
    
    # Normalize common industrial patterns
    result = re.sub(r'\bTO\s+ES\b', 'TO ES', result, flags=re.IGNORECASE)
    result = re.sub(r'\bgodon\b', 'Godown', result, flags=re.IGNORECASE)
    result = re.sub(r'\bgodown\b', 'Godown', result, flags=re.IGNORECASE)
    
    return result
