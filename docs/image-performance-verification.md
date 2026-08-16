# Image delivery verification

On 2026-08-16, the public homepage, tour catalogue, and Triund detail page were checked in a browser after responsive WebP delivery was enabled. The browser exposed compact `-card.webp` URLs for travel-style tiles and tour cards, and the `-hero.webp` URL for the Triund detail image. Carousel controls and WhatsApp actions remained present. No browser-console errors were reported on the Triund detail page.

The staged source-image set totals **6,651,683 bytes**. Its eight compact-card derivatives total **472,066 bytes**, and its eight hero derivatives total **1,403,124 bytes**. The production implementation requests the compact variant for tour cards, and the hero variant for the active detail and homepage images.

Across this image set, the compact-card derivatives reduce potential transfer bytes by **92.9%** and the hero derivatives by **78.9%** versus serving the original sources. New administrator JPG, PNG, and WebP uploads are resized to a maximum 1600-pixel side and converted to WebP in the browser before they are sent to storage, with a 1.5 MB optimized-output ceiling.
