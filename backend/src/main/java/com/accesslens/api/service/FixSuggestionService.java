package com.accesslens.api.service;

import com.accesslens.api.dto.FixSuggestion;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FixSuggestionService {
    private final Map<String, FixSuggestion> fixes = new HashMap<>();

    public FixSuggestionService() {
        initializeFixes();
    }

    private void initializeFixes() {
        fixes.put("image-alt", new FixSuggestion(
            "image-alt",
            "Add alternative text to images",
            "Every image must have descriptive alternative text so screen reader users know what the image shows. Alt text is not always visible, but it's essential for accessibility.",
            "Users who are blind or have low vision rely on alt text to understand images. Without it, they miss important information.",
            "<img src=\"logo.png\">",
            "<img src=\"logo.png\" alt=\"Company logo\">",
            "WCAG 2.1 Success Criterion 1.1.1 Non-text Content (Level A)",
            new String[] {
                "Remove the alt attribute and re-scan — the violation should be gone.",
                "Test with a screen reader like NVDA or JAWS to verify the alt text is read correctly.",
                "Make sure the alt text is concise (under 125 characters) and descriptive."
            },
            new String[] {
                "Identify the purpose or content of the image.",
                "Write a brief, descriptive text that conveys that purpose (e.g., 'Company logo' for a logo).",
                "If the image is purely decorative, use an empty alt attribute: alt=\"\""
            }
        ));

        fixes.put("label", new FixSuggestion(
            "label",
            "Associate a label with form inputs",
            "Every form input (text field, checkbox, etc.) must have an associated <label> element with a for attribute matching the input's id.",
            "Screen reader users rely on labels to understand what each form field is for. Without labels, they cannot fill out forms correctly.",
            "<input type=\"email\" placeholder=\"Enter email\">",
            "<label for=\"email\">Email address</label>\n<input id=\"email\" type=\"email\" placeholder=\"Enter email\">",
            "WCAG 2.1 Success Criterion 1.3.1 Info and Relationships (Level A)",
            new String[] {
                "Add a label element before or after the input.",
                "Set the label's 'for' attribute to match the input's 'id'.",
                "Re-scan to verify the issue is resolved."
            },
            new String[] {
                "Wrap the input in a <label> tag: <label>Email <input type=\"email\"></label>",
                "Or use explicit labeling with matching id and for attributes.",
                "Test with a screen reader to confirm the label is announced."
            }
        ));

        fixes.put("color-contrast", new FixSuggestion(
            "color-contrast",
            "Ensure sufficient color contrast",
            "Text must have a contrast ratio of at least 4.5:1 against its background (for normal text) or 3:1 (for large text).",
            "Users with low vision or color blindness need sufficient contrast to read text. Weak contrast makes content unreadable for them.",
            "<p style=\"color: #777; background: white;\">Low contrast text</p>",
            "<p style=\"color: #333; background: white;\">Better contrast text</p>",
            "WCAG 2.1 Success Criterion 1.4.3 Contrast (Minimum) (Level AA)",
            new String[] {
                "Use a contrast checker tool (e.g., WebAIM Color Contrast Checker).",
                "Test the ratio between foreground and background colors.",
                "If it's below 4.5:1, darken the foreground or lighten the background."
            },
            new String[] {
                "Avoid using light gray (#999+) on white.",
                "Test with color blindness simulators to ensure clarity.",
                "Use online tools like Contrast Ratio to check your colors."
            }
        ));

        fixes.put("html-has-lang", new FixSuggestion(
            "html-has-lang",
            "Add lang attribute to html element",
            "The <html> element must have a lang attribute specifying the page language (e.g., lang=\"en\" for English).",
            "Screen readers use the lang attribute to apply correct pronunciation rules. Without it, they may mispronounce words.",
            "<html>",
            "<html lang=\"en\">",
            "WCAG 2.1 Success Criterion 3.1.1 Language of Page (Level A)",
            new String[] {
                "Add lang=\"en\" (or the appropriate language code).",
                "Re-scan to verify the issue is resolved."
            },
            new String[] {
                "Use ISO 639-1 language codes (en, es, fr, de, etc.).",
                "For regional variants, use lang=\"en-US\" or lang=\"en-GB\".",
                "If your page has multiple languages, use lang attributes on specific elements."
            }
        ));

        fixes.put("document-title", new FixSuggestion(
            "document-title",
            "Add a descriptive page title",
            "Every page must have a <title> element in the <head> that describes the page's purpose.",
            "Screen reader users hear the page title first when navigating to a new page. A meaningful title helps them understand where they are.",
            "<head><meta charset=\"utf-8\"></head>",
            "<head><meta charset=\"utf-8\"><title>Contact Us - Acme Company</title></head>",
            "WCAG 2.1 Success Criterion 2.4.2 Page Titled (Level A)",
            new String[] {
                "Add a <title> tag with a descriptive, unique title.",
                "Make sure the title is concise (under 60 characters for SEO and clarity).",
                "Re-scan to verify."
            },
            new String[] {
                "Include the page purpose or topic (e.g., 'Contact Us' instead of 'Page 3').",
                "For multi-page sites, make each title unique.",
                "Avoid generic titles like 'Home' or 'Welcome'."
            }
        ));

        fixes.put("link-name", new FixSuggestion(
            "link-name",
            "Provide descriptive link text",
            "Links must have an accessible name that describes the link's purpose. Avoid generic text like 'Click here' or 'Read more'.",
            "Screen reader users rely on link text to understand where a link goes. Generic text provides no context.",
            "<a href=\"/dashboard\">Click here</a>",
            "<a href=\"/dashboard\">Go to dashboard</a>",
            "WCAG 2.1 Success Criterion 2.4.4 Link Purpose (In Context) (Level A)",
            new String[] {
                "Replace generic link text with descriptive text.",
                "Test with a screen reader to ensure the purpose is clear."
            },
            new String[] {
                "If the link has only an icon, add an aria-label attribute.",
                "Example: <a href=\"/home\" aria-label=\"Go to home page\"><i class=\"icon-home\"></i></a>",
                "For image links, ensure the alt text describes the destination."
            }
        ));

        fixes.put("button-name", new FixSuggestion(
            "button-name",
            "Provide descriptive button text",
            "Buttons must have an accessible name (visible text or aria-label) that describes the button's action.",
            "Screen reader users need to know what a button does before activating it.",
            "<button type=\"button\">→</button>",
            "<button type=\"button\">Submit Form</button>",
            "WCAG 2.1 Success Criterion 4.1.2 Name, Role, Value (Level A)",
            new String[] {
                "Add visible text to the button.",
                "If only an icon is used, add aria-label=\"[action description]\""
            },
            new String[] {
                "Use action verbs: Submit, Download, Next, etc.",
                "Avoid single characters or unclear abbreviations."
            }
        ));

        fixes.put("html-lang-valid", new FixSuggestion(
            "html-lang-valid",
            "Use a valid language code",
            "The lang attribute must contain a valid BCP 47 language tag (e.g., 'en', 'es', 'fr-CA').",
            "Screen readers rely on valid language codes to apply correct pronunciation and character rendering.",
            "<html lang=\"english\">",
            "<html lang=\"en\">",
            "WCAG 2.1 Success Criterion 3.1.1 Language of Page (Level A)",
            new String[] {
                "Use ISO 639-1 language codes (en, es, fr, de).",
                "For regional variants, use lang=\"en-US\" format."
            },
            new String[] {
                "Check the BCP 47 registry for valid codes.",
                "Common codes: en (English), es (Spanish), fr (French), de (German), zh (Chinese)"
            }
        ));

        fixes.put("heading-order", new FixSuggestion(
            "heading-order",
            "Use proper heading hierarchy",
            "Headings should follow a logical order: <h1>, then <h2>, <h3>, etc. Do not skip levels (e.g., jump from <h1> to <h3>).",
            "Screen reader users rely on heading hierarchy to navigate and understand page structure. Skipped levels cause confusion.",
            "<h1>Welcome</h1>\n<h3>Our Services</h3>",
            "<h1>Welcome</h1>\n<h2>Our Services</h2>",
            "WCAG 2.1 Success Criterion 1.3.1 Info and Relationships (Level A)",
            new String[] {
                "Restructure headings to follow sequential order.",
                "Test with a screen reader to verify the structure is clear."
            },
            new String[] {
                "Use only one <h1> per page for the main heading.",
                "Use <h2> for major sections, <h3> for subsections, etc.",
                "Never jump levels to achieve visual styling — use CSS instead."
            }
        ));

        fixes.put("landmark-one-main", new FixSuggestion(
            "landmark-one-main",
            "Include a main landmark",
            "Every page should have exactly one <main> element to contain the page's main content, excluding header, nav, and footer.",
            "Screen reader users use landmarks to navigate and understand page structure. The <main> landmark helps them jump to content quickly.",
            "<body>\n  <header>...</header>\n  <nav>...</nav>\n  <div>Page content</div>\n</body>",
            "<body>\n  <header>...</header>\n  <nav>...</nav>\n  <main>\n    Page content\n  </main>\n</body>",
            "WCAG 2.1 Success Criterion 1.3.1 Info and Relationships (Level A)",
            new String[] {
                "Wrap your main content in a <main> element.",
                "Ensure only one <main> element per page.",
                "Re-scan to verify."
            },
            new String[] {
                "Place <main> after <header> and <nav>.",
                "Do not nest <main> inside other landmarks.",
                "Use semantic HTML: <header>, <nav>, <main>, <aside>, <footer>"
            }
        ));

        fixes.put("aria-required-attr", new FixSuggestion(
            "aria-required-attr",
            "Add required ARIA attributes",
            "Some ARIA roles require specific attributes to function. For example, a slider requires aria-valuenow, aria-valuemin, and aria-valuemax.",
            "Without required ARIA attributes, assistive technologies cannot correctly interpret custom interactive components.",
            "<div role=\"slider\"></div>",
            "<div role=\"slider\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>",
            "WCAG 2.1 Success Criterion 4.1.2 Name, Role, Value (Level A)",
            new String[] {
                "Check the ARIA Authoring Practices Guide for the required attributes for your role.",
                "Add all required attributes with appropriate values.",
                "Test with a screen reader."
            },
            new String[] {
                "Use the official ARIA roles and attributes from the W3C ARIA specification.",
                "When possible, use native HTML elements instead of custom ARIA widgets."
            }
        ));

        fixes.put("aria-valid-attr", new FixSuggestion(
            "aria-valid-attr",
            "Use valid ARIA attribute names",
            "ARIA attributes must follow the correct naming convention (e.g., aria-label, aria-hidden, not aria_label or ariaLabel).",
            "Invalid ARIA attribute names are ignored by assistive technologies, making custom components inaccessible.",
            "<div aria-hiden=\"true\"></div>",
            "<div aria-hidden=\"true\"></div>",
            "WCAG 2.1 Success Criterion 4.1.2 Name, Role, Value (Level A)",
            new String[] {
                "Check the ARIA attribute name spelling and hyphenation.",
                "Use lowercase with hyphens (aria-label, not aria_label or ariaLabel)."
            },
            new String[] {
                "Refer to the W3C ARIA attributes specification.",
                "Common attributes: aria-label, aria-hidden, aria-required, aria-invalid, aria-live"
            }
        ));
    }

    public Optional<FixSuggestion> getFixForRule(String ruleId) {
        return Optional.ofNullable(fixes.get(ruleId));
    }
}
