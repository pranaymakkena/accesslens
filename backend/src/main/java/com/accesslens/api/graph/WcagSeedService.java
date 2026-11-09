package com.accesslens.api.graph;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Seeds the Neo4j graph with the static WCAG 2.1 specification structure
 * (Principles → Criteria) on application startup.  Idempotent: if the nodes
 * already exist they are merged, not duplicated.
 */
@Service
public class WcagSeedService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(WcagSeedService.class);

    private final WcagCriteriaRepository criteriaRepo;
    private final Neo4jWcagPrincipleRepository principleRepo;
    private final GraphAnalysisService graphAnalysisService;

    public WcagSeedService(WcagCriteriaRepository criteriaRepo,
                           Neo4jWcagPrincipleRepository principleRepo,
                           GraphAnalysisService graphAnalysisService) {
        this.criteriaRepo = criteriaRepo;
        this.principleRepo = principleRepo;
        this.graphAnalysisService = graphAnalysisService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (criteriaRepo.count() > 0) {
            log.info("WCAG graph already seeded ({} criteria nodes present).", criteriaRepo.count());
            return;
        }
        log.info("Seeding WCAG 2.1 specification graph into Neo4j…");
        seedPrinciples();
        seedCriteria();
        log.info("WCAG seed complete: {} criteria nodes.", criteriaRepo.count());
    }

    private void seedPrinciples() {
        principleRepo.saveAll(List.of(
            new WcagPrincipleNode("P1", "Perceivable",    "👁️"),
            new WcagPrincipleNode("P2", "Operable",       "⌨️"),
            new WcagPrincipleNode("P3", "Understandable", "🧠"),
            new WcagPrincipleNode("P4", "Robust",         "🔧")
        ));
    }

    private void seedCriteria() {
        // WCAG 2.1 — representative set mapped to the axe-core rules we test
        // format: (id, name, level, principle, guideline, description, url)
        List<WcagCriteriaNode> criteria = List.of(
            // ── Perceivable ────────────────────────────────────────────
            sc("1.1.1", "Non-text Content", "A", "Perceivable", "Text Alternatives",
               "All non-text content has a text alternative that serves the equivalent purpose.",
               "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html"),
            sc("1.2.2", "Captions (Prerecorded)", "A", "Perceivable", "Time-based Media",
               "Captions are provided for all prerecorded audio content in synchronized media.",
               "https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html"),
            sc("1.3.1", "Info and Relationships", "A", "Perceivable", "Adaptable",
               "Information, structure, and relationships can be programmatically determined.",
               "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html"),
            sc("1.3.5", "Identify Input Purpose", "AA", "Perceivable", "Adaptable",
               "The purpose of input fields can be programmatically determined.",
               "https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose.html"),
            sc("1.4.1", "Use of Color", "A", "Perceivable", "Distinguishable",
               "Color is not used as the only visual means of conveying information.",
               "https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html"),
            sc("1.4.3", "Contrast (Minimum)", "AA", "Perceivable", "Distinguishable",
               "Text has a contrast ratio of at least 4.5:1.",
               "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"),
            sc("1.4.4", "Resize Text", "AA", "Perceivable", "Distinguishable",
               "Text can be resized without assistive technology up to 200% without loss of content.",
               "https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html"),
            sc("1.4.6", "Contrast (Enhanced)", "AAA", "Perceivable", "Distinguishable",
               "Text has a contrast ratio of at least 7:1.",
               "https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html"),
            // ── Operable ───────────────────────────────────────────────
            sc("2.1.1", "Keyboard", "A", "Operable", "Keyboard Accessible",
               "All functionality is operable through a keyboard interface.",
               "https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html"),
            sc("2.4.1", "Bypass Blocks", "A", "Operable", "Navigable",
               "A mechanism is available to bypass blocks of content repeated across pages.",
               "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html"),
            sc("2.4.2", "Page Titled", "A", "Operable", "Navigable",
               "Web pages have titles that describe topic or purpose.",
               "https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html"),
            sc("2.4.3", "Focus Order", "A", "Operable", "Navigable",
               "If a web page can be navigated sequentially, focusable components receive focus in an order that preserves meaning.",
               "https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html"),
            sc("2.4.4", "Link Purpose (In Context)", "A", "Operable", "Navigable",
               "The purpose of each link can be determined from the link text alone.",
               "https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html"),
            sc("2.4.11", "Focus Appearance", "AA", "Operable", "Navigable",
               "Keyboard focus indicators are visible with sufficient size and contrast.",
               "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html"),
            // ── Understandable ─────────────────────────────────────────
            sc("3.1.1", "Language of Page", "A", "Understandable", "Readable",
               "The default human language of each web page can be programmatically determined.",
               "https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html"),
            sc("3.3.1", "Error Identification", "A", "Understandable", "Input Assistance",
               "If an input error is automatically detected, the item in error is identified and described to the user.",
               "https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html"),
            sc("3.3.2", "Labels or Instructions", "A", "Understandable", "Input Assistance",
               "Labels or instructions are provided when content requires user input.",
               "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html"),
            // ── Robust ─────────────────────────────────────────────────
            sc("4.1.1", "Parsing", "A", "Robust", "Compatible",
               "In content implemented using markup languages, elements have complete start and end tags.",
               "https://www.w3.org/WAI/WCAG21/Understanding/parsing.html"),
            sc("4.1.2", "Name, Role, Value", "A", "Robust", "Compatible",
               "For all user interface components, the name and role can be programmatically determined.",
               "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html"),
            sc("4.1.3", "Status Messages", "AA", "Robust", "Compatible",
               "Status messages can be programmatically determined through role or properties.",
               "https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html")
        );
        criteriaRepo.saveAll(criteria);
    }

    private WcagCriteriaNode sc(String id, String name, String level, String principle,
                                 String guideline, String description, String url) {
        return new WcagCriteriaNode(id, name, level, principle, guideline, description, url);
    }
}
