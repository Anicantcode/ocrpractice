"""
Unit tests for Marathi factory lexicon & transliteration.
"""
import pytest
from backend.ocr import translate_marathi_mixed, convert_devanagari_digits


def test_devanagari_digit_conversion():
    assert convert_devanagari_digits("०१२३४५६७८९") == "0123456789"
    assert convert_devanagari_digits("१५ पॅलेट") == "15 पॅलेट"
    assert convert_devanagari_digits("50") == "50"


def test_marathi_factory_translation():
    test_cases = [
        ("गाड्यांमधी Pallets लोडींग करणे", "Inside vehicles Pallets Loading"),
        ("परिसर loading", "Yard loading"),
        ("कंपनी Unloading", "Company Unloading"),
        ("काळे गोडाऊन", "Kale Godown"),
        ("थापी लाकडी पट्टा", "Stack Wooden Belt"),
        ("थापी", "Stack"),
        ("११२ पैकी कामाश", "112 of Work"),
        ("godon TO ES", "Godown TO ES"),
        ("संतोष पोपटकर", "Santosh Popatkar"),
        ("Pallet Handling/Loading- FG per Pallet", "Pallet Handling/Loading- FG per Pallet"),
        ("काळे loading", "Kale loading"),
        ("काळे unloading", "Kale Unloading"),
        ("कंपनी loading", "Company loading")
    ]

    for input_txt, expected in test_cases:
        actual = translate_marathi_mixed(input_txt)
        assert actual.lower() == expected.lower(), f"Expected '{expected}', got '{actual}' for '{input_txt}'"
