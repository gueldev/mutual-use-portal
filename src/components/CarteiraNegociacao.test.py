"""Regressão: salvar negociação exige clique, não ativação pelo teclado."""
import unittest
from playwright.sync_api import sync_playwright


class SalvarNegociacaoTest(unittest.TestCase):
    def test_salvar_somente_por_clique(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 1800})
            page.goto("http://localhost:8080")
            page.wait_for_timeout(1500)
            page.get_by_role("button", name="Carteira de Negociação", exact=True).click()
            page.get_by_placeholder("10 dígitos").wait_for()
            page.get_by_placeholder("000.000.000-00 ou 00.000.000/0000-00").fill("52998224725")
            page.get_by_placeholder("10 dígitos").fill("1234567890")
            for label, value in [("Nome do Parceiro", "Parceiro"), ("Plaqueta", "12345"), ("Razão Social", "Empresa")]:
                page.locator("div.flex.flex-col.gap-1\\.5").filter(
                    has=page.locator("label", has_text=label)
                ).locator("input").fill(value)
            confirmation = page.get_by_text("Dados do cliente validados.", exact=True)
            save = page.get_by_role("button", name="Salvar", exact=True)
            page.get_by_placeholder("10 dígitos").press("Enter")
            self.assertFalse(confirmation.is_visible())
            save.press("Enter")
            self.assertFalse(confirmation.is_visible())
            save.press("Space")
            self.assertFalse(confirmation.is_visible())
            save.click()
            confirmation.wait_for()
            self.assertTrue(confirmation.is_visible())
            browser.close()


if __name__ == "__main__":
    unittest.main()