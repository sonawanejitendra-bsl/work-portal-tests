"""Switch Selenium into the JD Edwards frame that contains a locator.

Stories add page keywords in resources. They do not add another Python library.
"""

from __future__ import annotations

import time

from robot.api import logger
from robot.libraries.BuiltIn import BuiltIn
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


class JdeSupport:
    """Shared frame switch for the JD Edwards web client."""

    ROBOT_LIBRARY_SCOPE = "SUITE"

    def select_frame_containing(self, selector: str, timeout: str = "60s") -> None:
        """Leave the driver inside the frame that contains ``selector``."""
        driver = BuiltIn().get_library_instance("SeleniumLibrary").driver
        by, value = _split(selector)
        seconds = _seconds(timeout)
        deadline = time.time() + seconds
        while time.time() < deadline:
            try:
                driver.switch_to.default_content()
                if _search(driver, by, value):
                    return
            except WebDriverException as exc:
                logger.debug(f"Frame search retry: {exc}")
            time.sleep(0.4)
        raise AssertionError(f"JD Edwards did not show {selector}")


def _split(selector: str) -> tuple[str, str]:
    kind, _, value = selector.partition(":")
    if kind == "css":
        return By.CSS_SELECTOR, value
    if kind == "xpath":
        return By.XPATH, value
    if kind == "id":
        return By.ID, value
    raise AssertionError(f"Selector must start with css:, xpath:, or id:: {selector}")


def _seconds(timeout: str) -> float:
    text = str(timeout).strip().lower()
    if text.endswith("s"):
        text = text[:-1]
    return float(text)


def _search(driver, by: str, value: str, depth: int = 0) -> bool:
    if depth > 8:
        return False
    if driver.find_elements(by, value):
        return True
    frames = driver.find_elements(By.CSS_SELECTOR, "iframe, frame")
    for index in range(len(frames)):
        frames = driver.find_elements(By.CSS_SELECTOR, "iframe, frame")
        if index >= len(frames):
            break
        try:
            driver.switch_to.frame(frames[index])
        except WebDriverException:
            continue
        if _search(driver, by, value, depth + 1):
            return True
        try:
            driver.switch_to.parent_frame()
        except WebDriverException:
            driver.switch_to.default_content()
            return False
    return False
