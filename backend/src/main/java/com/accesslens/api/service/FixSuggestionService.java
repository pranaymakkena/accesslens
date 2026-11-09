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

        // ── New fixes ─────────────────────────────────────────────────────

        fixes.put("select-name", new FixSuggestion(
            "select-name",
            "Add a label to select dropdowns",
            "Every <select> element must have an associated <label> so screen reader users know what the dropdown is for.",
            "Without a label, screen reader users cannot determine the purpose of a dropdown, making forms difficult or impossible to use.",
            "<select><option>Option 1</option></select>",
            "<label for=\"country\">Country</label>\n<select id=\"country\"><option>Option 1</option></select>",
            "WCAG 2.1 Success Criterion 1.3.1 Info and Relationships (Level A)",
            new String[] {
                "Add a <label for=\"...\"> that matches the select's id.",
                "Verify with a screen reader that the label is announced when the select receives focus."
            },
            new String[] {
                "Use explicit labeling: <label for=\"id\">Label</label><select id=\"id\">",
                "Or wrap: <label>Country <select>...</select></label>",
                "Do not rely on placeholder-style first <option> as a label — it disappears after selection."
            }
        ));

        fixes.put("input-image-alt", new FixSuggestion(
            "input-image-alt",
            "Add alt text to image inputs",
            "<input type=\"image\"> acts as a button with an image. It must have an alt attribute describing its action.",
            "Screen reader users will not know the purpose of an image button without alt text.",
            "<input type=\"image\" src=\"search.png\">",
            "<input type=\"image\" src=\"search.png\" alt=\"Search\">",
            "WCAG 2.1 Success Criterion 1.1.1 Non-text Content (Level A)",
            new String[] {
                "Add an alt attribute describing the button action (not just the image appearance).",
                "Test with a screen reader to verify it's read as a button."
            },
            new String[] {
                "Describe the action the button performs, e.g., alt=\"Submit search\".",
                "Consider replacing <input type=\"image\"> with <button type=\"submit\"> for simpler accessibility."
            }
        ));

        fixes.put("frame-title", new FixSuggestion(
            "frame-title",
            "Add a title to iframes",
            "Every <iframe> must have a title attribute that describes its content so assistive technology users can decide whether to navigate into it.",
            "Screen reader users encounter each iframe as a navigation stop. Without a title they cannot know whether the frame contains relevant content.",
            "<iframe src=\"https://example.com/map\"></iframe>",
            "<iframe src=\"https://example.com/map\" title=\"Interactive store location map\"></iframe>",
            "WCAG 2.1 Success Criterion 2.4.1 Bypass Blocks (Level A)",
            new String[] {
                "Add a descriptive title attribute to the iframe.",
                "Test with NVDA or VoiceOver to confirm it's announced before entering the frame."
            },
            new String[] {
                "Make the title specific: 'Payment form' not just 'iframe'.",
                "If the iframe is decorative, add title=\"\" and aria-hidden=\"true\" to hide it from assistive tech."
            }
        ));

        fixes.put("duplicate-id", new FixSuggestion(
            "duplicate-id",
            "Remove duplicate id attributes",
            "Every id attribute value must be unique within a page. Duplicate ids break ARIA relationships and label associations.",
            "When ids are duplicated, ARIA labelledby, describedby, and for attributes may point to the wrong element, breaking the accessible name computation.",
            "<label for=\"name\">Name</label><input id=\"name\"><input id=\"name\">",
            "<label for=\"first-name\">First Name</label><input id=\"first-name\">\n<label for=\"last-name\">Last Name</label><input id=\"last-name\">",
            "WCAG 2.1 Success Criterion 4.1.1 Parsing (Level A)",
            new String[] {
                "Search for duplicate id values using browser DevTools or a linter.",
                "Ensure each id is globally unique on the page."
            },
            new String[] {
                "Use meaningful, specific ids (e.g., 'checkout-email' instead of 'email').",
                "For dynamically generated lists, append a unique index (e.g., item-1, item-2).",
                "Consider using aria-labelledby with generated unique ids in components."
            }
        ));

        fixes.put("tabindex", new FixSuggestion(
            "tabindex",
            "Avoid positive tabindex values",
            "Using tabindex values greater than 0 creates a custom tab order that often confuses keyboard users and breaks natural focus flow.",
            "Keyboard and switch-access users depend on a predictable, logical focus order. Positive tabindex values disrupt this and create confusing navigation.",
            "<a href=\"/\" tabindex=\"3\">Home</a>",
            "<a href=\"/\">Home</a>",
            "WCAG 2.1 Success Criterion 2.4.3 Focus Order (Level A)",
            new String[] {
                "Remove all tabindex values greater than 0.",
                "Use tabindex=\"0\" to make non-focusable elements focusable.",
                "Use tabindex=\"-1\" to remove elements from tab order while keeping them programmatically focusable."
            },
            new String[] {
                "Restructure your DOM order to create the desired focus sequence.",
                "Reserve tabindex=\"0\" for custom interactive elements like <div role=\"button\">.",
                "Use CSS order or flexbox order for visual reordering without changing DOM order."
            }
        ));

        fixes.put("meta-viewport", new FixSuggestion(
            "meta-viewport",
            "Do not block user zoom",
            "The meta viewport tag must not use user-scalable=no or maximum-scale less than 2. Blocking zoom prevents users with low vision from reading content.",
            "Many users with low vision need to zoom in to 200% or more to read content. Disabling zoom makes the page inaccessible to them.",
            "<meta name=\"viewport\" content=\"width=device-width, user-scalable=no\">",
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
            "WCAG 2.1 Success Criterion 1.4.4 Resize Text (Level AA)",
            new String[] {
                "Remove user-scalable=no from the viewport meta tag.",
                "Remove maximum-scale values below 2.",
                "Test by zooming in on a mobile device to verify the page remains usable."
            },
            new String[] {
                "Use responsive CSS instead of viewport restrictions to handle layout at various sizes.",
                "Test your layout at 200% zoom in a desktop browser to spot any overflow issues."
            }
        ));

        fixes.put("bypass", new FixSuggestion(
            "bypass",
            "Add a skip navigation link",
            "Pages with repeated navigation must provide a mechanism to skip to the main content, typically a visually-hidden 'Skip to main content' link at the top of the page.",
            "Keyboard-only users must press Tab many times to reach main content on every page load if there is no skip link. This is exhausting and excludes people with motor disabilities.",
            "<body>\n  <nav>...many nav links...</nav>\n  <main>Page content</main>\n</body>",
            "<body>\n  <a href=\"#main-content\" class=\"skip-link\">Skip to main content</a>\n  <nav>...</nav>\n  <main id=\"main-content\">Page content</main>\n</body>",
            "WCAG 2.1 Success Criterion 2.4.1 Bypass Blocks (Level A)",
            new String[] {
                "Add a skip link as the very first focusable element on the page.",
                "Make it visible on keyboard focus (not permanently hidden).",
                "Verify it jumps focus to the <main> element when activated."
            },
            new String[] {
                "CSS for a skip link: .skip-link { position:absolute; top:-40px; } .skip-link:focus { top:0; }",
                "The target element (main) should have a matching id.",
                "Consider adding skip links for other repeated blocks like site search."
            }
        ));

        fixes.put("aria-hidden-focus", new FixSuggestion(
            "aria-hidden-focus",
            "Remove focusable elements from aria-hidden regions",
            "Focusable elements must not be inside an element with aria-hidden=\"true\". This causes a mismatch where keyboard focus enters content that assistive technology ignores.",
            "When a keyboard-focusable element is hidden from the accessibility tree but not from keyboard navigation, screen reader users experience a 'ghost focus' — the cursor moves but nothing is announced.",
            "<div aria-hidden=\"true\">\n  <button>Submit</button>\n</div>",
            "<div aria-hidden=\"true\">\n  <button tabindex=\"-1\">Submit</button>\n</div>\n<!-- OR remove aria-hidden from the parent -->",
            "WCAG 2.1 Success Criterion 4.1.2 Name, Role, Value (Level A)",
            new String[] {
                "Add tabindex=\"-1\" to all focusable elements inside the aria-hidden container.",
                "Or remove aria-hidden from the container.",
                "Test with keyboard-only navigation to confirm focus does not enter the hidden area."
            },
            new String[] {
                "Prefer removing aria-hidden from containers that hold interactive elements.",
                "Use aria-hidden only on purely decorative, non-interactive content.",
                "For modal dialogs, trap focus inside the dialog rather than hiding the backdrop with aria-hidden."
            }
        ));

        fixes.put("color-contrast-enhanced", new FixSuggestion(
            "color-contrast-enhanced",
            "Meet enhanced (AAA) contrast ratio of 7:1",
            "For WCAG AAA compliance, normal text needs a contrast ratio of at least 7:1 against its background (4.5:1 for large text).",
            "Enhanced contrast benefits users with more severe vision impairments including moderate low vision without assistive technology.",
            "<p style=\"color: #767676; background: white;\">Text with 4.5:1 ratio (AA only)</p>",
            "<p style=\"color: #595959; background: white;\">Text with 7:1 ratio (AAA)</p>",
            "WCAG 2.1 Success Criterion 1.4.6 Contrast (Enhanced) (Level AAA)",
            new String[] {
                "Use a contrast checker tool to verify 7:1 ratio.",
                "Darken text color or lighten background to reach 7:1.",
                "Test with simulated low-vision to verify readability."
            },
            new String[] {
                "For dark-on-light: use #595959 on white (#fff) for exactly 7:1.",
                "Use design tokens for consistent color application.",
                "Prioritise AAA contrast for body text; decorative or large text may use AA (4.5:1)."
            }
        ));

        fixes.put("object-alt", new FixSuggestion(
            "object-alt",
            "Add alternative content to <object> elements",
            "The <object> element must have text content or an accessible name so users who cannot render the object (e.g., PDF or Flash fallback) still receive the information.",
            "Users with assistive technology and users whose browsers cannot render the embedded object will see nothing if no fallback is provided.",
            "<object data=\"chart.pdf\" type=\"application/pdf\"></object>",
            "<object data=\"chart.pdf\" type=\"application/pdf\">\n  <p>Q3 sales chart: revenue increased 20% year-over-year. <a href=\"chart-data.html\">View data table</a></p>\n</object>",
            "WCAG 2.1 Success Criterion 1.1.1 Non-text Content (Level A)",
            new String[] {
                "Add descriptive fallback content between the opening and closing <object> tags.",
                "Verify the fallback is accessible by disabling the object in DevTools."
            },
            new String[] {
                "Provide a link to an accessible alternative (e.g., HTML data table for a chart).",
                "Consider replacing <object> with native HTML5 elements or accessible SVG."
            }
        ));

        fixes.put("scrollable-region-focusable", new FixSuggestion(
            "scrollable-region-focusable",
            "Make scrollable regions keyboard-accessible",
            "Any element that can be scrolled with a mouse must also be reachable and operable via keyboard. Add tabindex=\"0\" to make it focusable, then arrow keys can scroll it.",
            "Keyboard-only users cannot scroll an overflowing container unless it is in the tab order. This traps content from keyboard navigation.",
            "<div style=\"overflow:auto; max-height:200px\">...long content...</div>",
            "<div style=\"overflow:auto; max-height:200px\" tabindex=\"0\" role=\"region\" aria-label=\"Scrollable news feed\">...long content...</div>",
            "WCAG 2.1 Success Criterion 2.1.1 Keyboard (Level A)",
            new String[] {
                "Add tabindex=\"0\" to the scrollable container.",
                "Add role=\"region\" and aria-label to convey its purpose.",
                "Test with keyboard only: Tab to the region, then use arrow keys to scroll."
            },
            new String[] {
                "Provide visible focus styling for the scrollable region.",
                "If content is a data table, use a <table> with overflow instead.",
                "Announce the scrollable region's purpose clearly in the aria-label."
            }
        ));

        fixes.put("focus-visible", new FixSuggestion(
            "focus-visible",
            "Ensure all focusable elements have a visible focus indicator",
            "Keyboard users must be able to see which element is focused. Never use outline:none without providing an alternative focus indicator.",
            "About 7 million keyboard-only users depend on the visible focus ring to navigate. Removing it makes a page impossible to use for them.",
            "<style>*:focus { outline: none; }</style>",
            "<style>*:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; border-radius: 2px; }</style>",
            "WCAG 2.1 Success Criterion 2.4.11 Focus Appearance (Level AA, 2.2)",
            new String[] {
                "Remove or override any CSS that hides the focus outline.",
                "Use :focus-visible to show the indicator for keyboard navigation only (not mouse clicks).",
                "Ensure the focus indicator has at least 3:1 contrast against the background."
            },
            new String[] {
                "Use box-shadow as an alternative for elements that overlap borders.",
                "Test with keyboard-only navigation in Chrome, Firefox, and Safari.",
                "A 2px solid outline with 2px offset is a reliable, accessible starting point."
            }
        ));

        fixes.put("autocomplete-valid", new FixSuggestion(
            "autocomplete-valid",
            "Use valid autocomplete attribute values",
            "The autocomplete attribute must use tokens from the HTML specification (e.g., 'name', 'email', 'tel'). Invalid values are ignored by browsers and assistive technologies.",
            "People with cognitive disabilities and motor impairments rely on browser autofill to reduce typing. Valid autocomplete tokens enable this feature.",
            "<input type=\"text\" autocomplete=\"fullname\">",
            "<input type=\"text\" autocomplete=\"name\" id=\"full-name\"><label for=\"full-name\">Full Name</label>",
            "WCAG 2.1 Success Criterion 1.3.5 Identify Input Purpose (Level AA)",
            new String[] {
                "Replace the invalid autocomplete value with the correct HTML5 token.",
                "Common tokens: name, email, tel, username, current-password, new-password, street-address, postal-code."
            },
            new String[] {
                "Refer to MDN's autocomplete attribute documentation for the full list.",
                "Use autocomplete=\"off\" only when autofill would be genuinely harmful (e.g., OTP fields)."
            }
        ));

        fixes.put("aria-roles", new FixSuggestion(
            "aria-roles",
            "Use valid ARIA role values",
            "The role attribute must contain a valid WAI-ARIA role. Using an incorrect role (e.g., role=\"main-nav\") has no effect and may confuse assistive technology.",
            "Invalid ARIA roles are treated as unknown by assistive technologies, which may ignore the element entirely and not convey its structure to users.",
            "<nav role=\"primary-navigation\">...</nav>",
            "<nav aria-label=\"Primary navigation\">...</nav>",
            "WCAG 2.1 Success Criterion 4.1.2 Name, Role, Value (Level A)",
            new String[] {
                "Replace the custom role with a valid WAI-ARIA role from the specification.",
                "Use native HTML elements where possible instead of ARIA roles."
            },
            new String[] {
                "Valid landmark roles: banner, navigation, main, complementary, contentinfo, form, search.",
                "Prefer <main> over <div role=\"main\">, <nav> over <div role=\"navigation\">, etc.",
                "Refer to the W3C ARIA specification for the complete role list."
            }
        ));
    }

    public Optional<FixSuggestion> getFixForRule(String ruleId) {
        return Optional.ofNullable(fixes.get(ruleId));
    }
}
