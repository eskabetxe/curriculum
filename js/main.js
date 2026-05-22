function formatDate(dateStr) {
    if (!dateStr || dateStr.toUpperCase() === 'CURRENT') return 'Present';
    var parts = dateStr.split('/');
    if (parts.length === 3) {
        var d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (parts.length === 2) {
        var d = new Date(parseInt(parts[1]), parseInt(parts[0]) - 1);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return dateStr;
}

function parseDate(str) {
    if (!str || str.toUpperCase() === 'CURRENT') return new Date();
    var p = str.split('/');
    if (p.length === 3) return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    if (p.length === 2) return new Date(parseInt(p[1]), parseInt(p[0]) - 1);
    return new Date();
}

function calculateTenure(roles) {
    var totalMonths = 0;
    roles.forEach(function(role) {
        var start = parseDate(role.period.from);
        var end = parseDate(role.period.to);
        var diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (diff >= 0) totalMonths += (diff + 1);
    });
    var yrs = Math.floor(totalMonths / 12);
    var mos = totalMonths % 12;
    var parts = [];
    if (yrs > 0) parts.push(yrs + ' year' + (yrs > 1 ? 's' : ''));
    if (mos > 0) parts.push(mos + ' month' + (mos > 1 ? 's' : ''));
    return parts.join(' ') || '1 mo';
}

function normalizeString(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, '');
}

function renderWebpage(cv) {
    var frame = document.getElementById('cv-rendering-frame');
    document.title = cv.personal.name + ' - Curriculum Vitae';

    frame.innerHTML =
        '<header>' +
            '<div class="header-main">' +
                '<h1>' + cv.personal.name + '</h1>' +
                '<div class="social-icons">' +
                    cv.social.map(function(s) {
                        return '<a href="' + s.url + '" target="_blank" title="' + s.name + '">' +
                            '<i class="fa ' + s.icon + ' fa-fw"></i>' +
                        '</a>';
                    }).join('') +
                    '<a href="#" class="pdf-icon" onclick="generateBrowserPDF(); return false;" title="Download PDF">' +
                        '<i class="fa fa-file-pdf-o fa-fw"></i>' +
                    '</a>' +
                '</div>' +
            '</div>' +
            '<div class="header-contact">' +
                '<span><i class="fa fa-map-marker fa-fw"></i> ' + cv.personal.location + '</span>' +
                '<span><i class="fa fa-phone fa-fw"></i> ' + cv.personal.phone + '</span>' +
                '<span><i class="fa fa-envelope fa-fw"></i> ' + cv.personal.email + '</span>' +
            '</div>' +
        '</header>' +

        (cv.about ? '<section class="section-about"><h2>Professional Summary</h2><p>' + cv.about + '</p></section>' : '') +

        '<div class="cv-grid">' +

            '<section class="section-experience">' +
                '<h2>Work Experience</h2>' +
                cv.experience.map(function(job) {
                    return '<article class="company-block">' +
                        '<div class="company-title-line">' +
                            '<h3>' + job.company + '</h3>' +
                            '<span class="company-duration">' + calculateTenure(job.roles) + '</span>' +
                        '</div>' +
                        '<div class="roles-container">' +
                            job.roles.map(function(role) {
                                return '<div class="role-wrapper">' +
                                    '<div class="role-node-dot"></div>' +
                                    '<div class="role-header-line">' +
                                        '<span class="role-title-text">' + role.title + '</span>' +
                                        '<span class="role-date-text">' +
                                            formatDate(role.period.from) + ' — ' + formatDate(role.period.to) +
                                        '</span>' +
                                    '</div>' +
                                    (role.via ? '<div class="role-metadata-row"><em>(via ' + role.via + ')</em></div>' : '') +
                                    (role.client ? '<div class="role-metadata-row"><strong>Client:</strong> ' + role.client + '</div>' : '') +
                                    (role.technologies && role.technologies.length ? '<div class="role-tech-chips">' + role.technologies.map(function(t){ return '<span class="tech-chip">' + t + '</span>'; }).join('') + '</div>' : '') +
                                    '<ul class="bullet-highlights">' +
                                        role.highlights.map(function(hl) {
                                            return '<li><strong>' + hl.title + '</strong>: ' + hl.description + '</li>';
                                        }).join('') +
                                    '</ul>' +
                                '</div>';
                            }).join('') +
                        '</div>' +
                    '</article>';
                }).join('') +
            '</section>' +

            '<div class="cv-sidebar">' +

            '<section class="section-competencies">' +
                '<h2>Core Competencies</h2>' +
                '<div class="skills-grid">' +
                    cv.skills.map(function(s) { return '<span class="skill-badge">' + s + '</span>'; }).join('') +
                '</div>' +
            '</section>' +

            '<section class="section-languages">' +
                '<h2>Languages</h2>' +
                '<div class="languages-block-wrapper">' +
                    cv.languages.map(function(lang) {
                        return '<div class="lang-row">' +
                            '<span>' + lang.name + '</span>' +
                            '<span class="lang-level">' + lang.level + '</span>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</section>' +

            '<section class="section-certifications">' +
                '<h2>Certifications</h2>' +
                cv.certifications.map(function(cert) {
                    return '<div class="meta-item-entry">' +
                        '<div class="meta-item-title">' + cert.title + '</div>' +
                        '<div class="meta-item-sub">' + cert.institution + '</div>' +
                        '<div class="meta-item-date">' + formatDate(cert.period.from) + ' — ' + formatDate(cert.period.to) + '</div>' +
                    '</div>';
                }).join('') +
            '</section>' +

            '<section class="section-education">' +
                '<h2>Education</h2>' +
                cv.education.map(function(edu) {
                    return '<div class="meta-item-entry">' +
                        '<div class="meta-item-title">' + edu.title + '</div>' +
                        '<div class="meta-item-sub">' + edu.institution + '</div>' +
                        '<div class="meta-item-date">' + formatDate(edu.period.from) + ' — ' + formatDate(edu.period.to) + '</div>' +
                    '</div>';
                }).join('') +
            '</section>' +

            '</div>' +

        '</div>';
}

function generateBrowserPDF() {
    fetch('curriculum.yml')
        .then(function(res) { return res.text(); })
        .then(function(yamlData) {
            var cv = jsyaml.load(yamlData);
            var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });

            var pageW = 210;
            var pageH = 297;
            var mx = 15;
            var mt = 15;
            var mb = 15;
            var cw = pageW - 2 * mx;
            var y = mt;

            function checkPage(needed) {
                if (y + needed > pageH - mb) {
                    doc.addPage();
                    y = mt;
                }
            }

            function sectionHeader(title) {
                checkPage(14);
                y += 4;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0);
                doc.text(title.toUpperCase(), mx, y);
                y += 1.5;
                doc.setDrawColor(160);
                doc.setLineWidth(0.3);
                doc.line(mx, y, mx + cw, y);
                y += 5;
            }

            function wrappedText(text, fontSize, style, indent, lineH) {
                indent = indent || 0;
                lineH = lineH || fontSize * 0.38;
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', style || 'normal');
                var lines = doc.splitTextToSize(text, cw - indent);
                for (var i = 0; i < lines.length; i++) {
                    checkPage(lineH);
                    doc.text(lines[i], mx + indent, y);
                    y += lineH;
                }
            }

            function bulletItem(title, description, indent) {
                indent = indent || 7;
                var bulletX = mx + indent;
                var textX = mx + indent + 4;
                var textW = cw - indent - 4;
                var fullText = title + ': ' + description;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                var lines = doc.splitTextToSize(fullText, textW);
                var lineH = 3.5;

                for (var i = 0; i < lines.length; i++) {
                    checkPage(lineH);
                    if (i === 0) {
                        doc.setTextColor(0);
                        doc.text('•', bulletX, y);

                        var titleWithColon = title + ': ';
                        doc.setFont('helvetica', 'bold');
                        var titleW = doc.getTextWidth(titleWithColon);
                        var lineText = lines[0];

                        if (titleW < textW && lineText.indexOf(titleWithColon) === 0) {
                            doc.text(titleWithColon, textX, y);
                            doc.setFont('helvetica', 'normal');
                            doc.text(lineText.substring(titleWithColon.length), textX + titleW, y);
                        } else {
                            doc.setFont('helvetica', 'normal');
                            doc.text(lineText, textX, y);
                        }
                    } else {
                        doc.text(lines[i], textX, y);
                    }
                    y += lineH;
                }
                y += 0.5;
            }

            // ---- NAME ----
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text(cv.personal.name, mx, y);
            y += 7;

            // ---- CONTACT ----
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80);
            doc.text(
                cv.personal.location + '  |  ' + cv.personal.phone + '  |  ' + cv.personal.email,
                mx, y
            );
            y += 4.5;

            // ---- SOCIAL LINKS ----
            if (cv.social && cv.social.length) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                var sep = '   ·   ';
                var sx = mx;
                cv.social.forEach(function(s, i) {
                    if (i > 0) {
                        doc.setTextColor(120);
                        doc.text(sep, sx, y);
                        sx += doc.getTextWidth(sep);
                    }
                    var label = s.name + ': ';
                    doc.setTextColor(60);
                    doc.setFont('helvetica', 'bold');
                    doc.text(label, sx, y);
                    sx += doc.getTextWidth(label);
                    doc.setFont('helvetica', 'normal');
                    var display = s.url.replace(/^https?:\/\/(www\.)?/, '');
                    doc.textWithLink(display, sx, y, { url: s.url });
                    sx += doc.getTextWidth(display);
                });
                y += 2.5;
            }

            doc.setTextColor(0);
            y += 1.5;
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(mx, y, mx + cw, y);
            y += 6;

            // ---- ABOUT ----
            if (cv.about) {
                sectionHeader('Professional Summary');
                wrappedText(cv.about, 10, 'normal', 0, 4);
                y += 2;
            }

            // ---- CORE COMPETENCIES ----
            sectionHeader('Core Competencies');
            wrappedText(cv.skills.join('  |  '), 10, 'normal');
            y += 2;

            // ---- WORK EXPERIENCE ----
            sectionHeader('Work Experience');
            cv.experience.forEach(function(job) {
                checkPage(20);

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0);
                var companyLabel = job.company;
                doc.text(companyLabel, mx, y);
                var compW = doc.getTextWidth(companyLabel);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);
                doc.text('  (' + calculateTenure(job.roles) + ')', mx + compW, y);
                doc.setTextColor(0);
                y += 6;

                job.roles.forEach(function(role) {
                    checkPage(15);

                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0);
                    var roleLabel = role.title;
                    if (role.via) roleLabel += '  (via ' + role.via + ')';
                    doc.text(roleLabel, mx + 3, y);
                    y += 4.5;

                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100);
                    doc.text(formatDate(role.period.from) + ' — ' + formatDate(role.period.to), mx + 3, y);
                    doc.setTextColor(0);
                    y += 4;

                    if (role.client) {
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'italic');
                        doc.text('Client: ' + role.client, mx + 3, y);
                        doc.setFont('helvetica', 'normal');
                        y += 3.5;
                    }

                    if (role.technologies && role.technologies.length) {
                        doc.setFontSize(8.5);
                        doc.setFont('helvetica', 'italic');
                        doc.setTextColor(90);
                        var techLine = 'Tech: ' + role.technologies.join(' · ');
                        var techLines = doc.splitTextToSize(techLine, cw - 3);
                        for (var ti = 0; ti < techLines.length; ti++) {
                            checkPage(3.5);
                            doc.text(techLines[ti], mx + 3, y);
                            y += 3.5;
                        }
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(0);
                        y += 1.5;
                    }

                    role.highlights.forEach(function(hl) {
                        bulletItem(hl.title, hl.description);
                    });

                    y += 2;
                });
                y += 2;
            });

            // ---- LANGUAGES ----
            sectionHeader('Languages');
            var langLine = cv.languages.map(function(l) {
                return l.name + ' (' + l.level + ')';
            }).join('  |  ');
            wrappedText(langLine, 10, 'normal');
            y += 2;

            // ---- CERTIFICATIONS ----
            sectionHeader('Certifications');
            cv.certifications.forEach(function(cert) {
                checkPage(8);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0);
                doc.text(cert.title, mx, y);
                y += 4;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80);
                doc.text(cert.institution + '  (' + formatDate(cert.period.from) + ' — ' + formatDate(cert.period.to) + ')', mx, y);
                doc.setTextColor(0);
                y += 5;
            });

            // ---- EDUCATION ----
            sectionHeader('Education');
            cv.education.forEach(function(edu) {
                checkPage(8);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0);
                doc.text(edu.title, mx, y);
                y += 4;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80);
                doc.text(edu.institution + '  (' + formatDate(edu.period.from) + ' — ' + formatDate(edu.period.to) + ')', mx, y);
                doc.setTextColor(0);
                y += 5;
            });

            doc.save(normalizeString(cv.personal.name) + '_CV.pdf');
        });
}

fetch('curriculum.yml')
    .then(function(res) {
        if (!res.ok) throw new Error("Failed to fetch curriculum data");
        return res.text();
    })
    .then(function(yamlData) {
        var cv = jsyaml.load(yamlData);
        renderWebpage(cv);
    })
    .catch(function(error) {
        document.getElementById('cv-rendering-frame').innerHTML =
            '<div style="padding: 20px; color: #9b2c2c; background: #fff5f5; border-radius: 6px; border: 1px solid #fed7d7;">' +
                '<h3 style="margin-bottom: 8px;">Loading Error</h3>' +
                '<p>Run via a local server to load the CV data:</p>' +
                '<code style="display:block; margin-top:10px; background:#edf2f7; padding:8px; border-radius:4px; font-weight:700;">python3 -m http.server</code>' +
            '</div>';
        console.error(error);
    });
