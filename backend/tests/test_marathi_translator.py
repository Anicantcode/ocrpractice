import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ocr.marathi_translator import translate_marathi_mixed, convert_devanagari_digits

def test_marathi_translation():
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
    
    print("Testing Marathi Translator:")
    all_passed = True
    for input_txt, expected in test_cases:
        actual = translate_marathi_mixed(input_txt)
        status = "✓" if actual.lower() == expected.lower() else "✗"
        print(f"[{status}] IN:  '{input_txt}'")
        print(f"    OUT: '{actual}' | EXPECTED: '{expected}'")
        if actual.lower() != expected.lower():
            all_passed = False
            
    print(f"\nAll tests passed: {all_passed}")

if __name__ == "__main__":
    test_marathi_translation()
