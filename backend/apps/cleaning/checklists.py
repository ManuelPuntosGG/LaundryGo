"""
GoPropertyCare Service Checklists & Preparation Guidelines Module.
Provides comprehensive room-by-room checklists, preparation instructions,
and client notices based on official company documentation.
Supports both English and Spanish rendering for transactional emails.
"""

# -----------------------------------------------------------------------------
# Checklists Definition by Service and Language
# -----------------------------------------------------------------------------

GPC_CHECKLISTS = {
    'standard': {
        'en': {
            'title': 'Standard Cleaning Checklist',
            'tagline': 'Our regular upkeep clean to keep your home fresh week after week.',
            'areas': [
                {
                    'name': 'Entryway',
                    'items': [
                        'Wipe down all furniture',
                        'Spot-clean the front door',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Living, Family & TV Rooms',
                    'items': [
                        'Wipe mirrors and light switches',
                        'Dust picture frames, décor, lamps and furniture',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Dining Room',
                    'items': [
                        'Wipe the table, chairs, mirrors and light switches',
                        'Dust picture frames, décor, lamps and furniture',
                        'Vacuum carpets or sweep and mop hard floors',
                    ],
                },
                {
                    'name': 'Kitchen',
                    'items': [
                        'Sanitize sinks, faucets, countertops and backsplash',
                        'Wipe soap dishes, light switches, doorknobs, table and chairs',
                        'Clean the outside of the stove, coffee maker, dishwasher and refrigerator',
                        'Clean the microwave inside and out',
                        'Spot-clean doors',
                        'Polish chrome faucets and fixtures',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Home Office',
                    'items': [
                        'Sanitize phones, computers and printers',
                        'Spot-clean doors',
                        'Dust all furniture',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash and recycling bins*',
                    ],
                },
                {
                    'name': 'Laundry Room',
                    'items': [
                        'Sanitize the utility sink, faucet, countertops and backsplash',
                        'Wipe the outside of the washer and dryer',
                        'Spot-clean doors and cabinet fronts',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Bedrooms',
                    'items': [
                        'Wipe mirrors, light switches and doorknobs',
                        'Spot-clean doors',
                        'Dust picture frames, décor and furniture',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Bathrooms',
                    'items': [
                        'Sanitize the shower, shower caddy, bathtub, toilet, sinks, faucets, vanity tops and backsplash',
                        'Wipe soap dishes, mirrors and light switches',
                        'Spot-clean doors',
                        'Polish chrome faucets and fixtures',
                        'Neatly fold and hang towels',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
            ],
            'footnotes': [
                '* Trash bag liners are provided by the client.',
                'Windowsills and deep cleaning of window tracks are available as add-ons.',
            ],
        },
        'es': {
            'title': 'Checklist de Limpieza Residencial Estándar',
            'tagline': 'Nuestra limpieza regular de mantenimiento para mantener tu hogar fresco semana tras semana.',
            'areas': [
                {
                    'name': 'Entrada / Recibidor',
                    'items': [
                        'Limpiar todos los muebles',
                        'Limpieza puntual de la puerta principal',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Sala de Estar, Familiar y TV',
                    'items': [
                        'Limpiar espejos e interruptores de luz',
                        'Desempolvar marcos, decoración, lámparas y muebles',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Comedor',
                    'items': [
                        'Limpiar mesa, sillas, espejos e interruptores de luz',
                        'Desempolvar marcos, decoración, lámparas y muebles',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                    ],
                },
                {
                    'name': 'Cocina',
                    'items': [
                        'Desinfectar fregaderos, grifos, encimeras y salpicaderos',
                        'Limpiar jaboneras, interruptores, manijas, mesa y sillas',
                        'Limpiar el exterior de la estufa, cafetera, lavavajillas y refrigerador',
                        'Limpiar el microondas por dentro y por fuera',
                        'Limpieza puntual de puertas',
                        'Pulir grifos y accesorios cromados',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Oficina en Casa',
                    'items': [
                        'Desinfectar teléfonos, computadoras e impresoras',
                        'Limpieza puntual de puertas',
                        'Desempolvar todos los muebles',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura y reciclaje*',
                    ],
                },
                {
                    'name': 'Cuarto de Lavado',
                    'items': [
                        'Desinfectar lavadero utilitario, grifo, encimeras y salpicadero',
                        'Limpiar el exterior de la lavadora y secadora',
                        'Limpieza puntual de puertas y frentes de gabinetes',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Dormitorios',
                    'items': [
                        'Limpiar espejos, interruptores de luz y manijas',
                        'Limpieza puntual de puertas',
                        'Desempolvar marcos, decoración y muebles',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Baños',
                    'items': [
                        'Desinfectar ducha, organizador, bañera, inodoro, lavamanos, grifos, tocador y salpicadero',
                        'Limpiar jaboneras, espejos e interruptores de luz',
                        'Limpieza puntual de puertas',
                        'Pulir grifos y accesorios cromados',
                        'Doblar y colgar toallas ordenadamente',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
            ],
            'footnotes': [
                '* Las bolsas de repuesto para basura son provistas por el cliente.',
                'Alféizares y limpieza profunda de rieles de ventanas disponibles como add-ons.',
            ],
        },
    },
    'deep': {
        'en': {
            'title': 'Deep Cleaning Checklist',
            'tagline': 'A top-to-bottom, detailed clean, ideal for a first visit or a seasonal reset.',
            'areas': [
                {
                    'name': 'Entryway',
                    'items': [
                        'Remove cobwebs',
                        'Wipe picture frames, décor, lamps, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, the front door and door frame',
                        'Dust blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Living, Family & TV Rooms',
                    'items': [
                        'Remove cobwebs',
                        'Wipe picture frames, décor, lamps, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum under couch cushions',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Dining Room',
                    'items': [
                        'Remove cobwebs',
                        'Wipe the table and chairs, picture frames, décor, lamps, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                    ],
                },
                {
                    'name': 'Kitchen',
                    'items': [
                        'Remove cobwebs',
                        'Sanitize sinks, faucets, countertops and backsplash',
                        'Wipe the stovetop, coffee maker, soap dishes, light switches, doorknobs, table, chairs, windowsills, light fixtures within reach and baseboards',
                        'Clean the outside of the dishwasher, refrigerator, stove and cabinet doors',
                        'Clean the microwave inside and out',
                        'Spot-clean walls, doors and door frames',
                        'Polish chrome faucets and fixtures',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Home Office',
                    'items': [
                        'Remove cobwebs',
                        'Wipe picture frames, décor, lamps, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Sanitize phones, computers and printers',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash and recycling bins*',
                    ],
                },
                {
                    'name': 'Laundry Room',
                    'items': [
                        'Remove cobwebs',
                        'Wipe the rubber seals around the washer and dryer doors, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Clean the outside of the washer, dryer and cabinet doors',
                        'Spot-clean walls, doors and door frames',
                        'Sanitize the utility sink, faucet, countertops and backsplash',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Bathrooms',
                    'items': [
                        'Remove cobwebs',
                        'Sanitize the shower, shower caddy, bathtub, toilet, sinks, faucets, vanity tops and backsplash',
                        'Wipe soap dishes, light switches, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Clean the outside of vanity doors',
                        'Spot-clean walls, doors and door frames',
                        'Polish chrome faucets and fixtures',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Neatly fold and hang towels',
                        'Sweep and mop the floor',
                        'Empty trash bins*',
                    ],
                },
                {
                    'name': 'Bedrooms',
                    'items': [
                        'Remove cobwebs',
                        'Wipe picture frames, décor, lamps, light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Empty trash bins*',
                    ],
                },
            ],
            'footnotes': [
                '* Trash bag liners are provided by the client.',
                'Deep cleaning of window tracks is available as an add-on.',
            ],
        },
        'es': {
            'title': 'Checklist de Limpieza Profunda',
            'tagline': 'Una limpieza detallada de arriba a abajo, ideal para una primera visita o puesta a punto.',
            'areas': [
                {
                    'name': 'Entrada / Recibidor',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar marcos, decoración, lámparas, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puerta principal y marco',
                        'Desempolvar persianas y rejillas de ventilación y calefacción',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Sala de Estar, Familiar y TV',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar marcos, decoración, lámparas, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar debajo de los cojines del sofá',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Comedor',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar mesa y sillas, marcos, decoración, lámparas, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                    ],
                },
                {
                    'name': 'Cocina',
                    'items': [
                        'Eliminar telarañas',
                        'Desinfectar fregaderos, grifos, encimeras y salpicaderos',
                        'Limpiar estufa, cafetera, jaboneras, interruptores, manijas, mesa, sillas, alféizares, lámparas al alcance y rodapiés',
                        'Limpiar el exterior del lavavajillas, refrigerador, estufa y puertas de gabinetes',
                        'Limpiar el microondas por dentro y por fuera',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Pulir grifos y accesorios cromados',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Oficina en Casa',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar marcos, decoración, lámparas, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desinfectar teléfonos, computadoras e impresoras',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura y reciclaje*',
                    ],
                },
                {
                    'name': 'Cuarto de Lavado',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar sellos de goma de lavadora/secadora, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpiar exterior de lavadora, secadora y puertas de gabinetes',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desinfectar lavadero utilitario, grifo, encimeras y salpicadero',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Baños',
                    'items': [
                        'Eliminar telarañas',
                        'Desinfectar ducha, organizador, bañera, inodoro, lavamanos, grifos, tocador y salpicadero',
                        'Limpiar jaboneras, interruptores, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpiar exterior de puertas del tocador',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Pulir grifos y accesorios cromados',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Doblar y colgar toallas ordenadamente',
                        'Barrer y trapear el piso',
                        'Vaciar botes de basura*',
                    ],
                },
                {
                    'name': 'Dormitorios',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar marcos, decoración, lámparas, interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Vaciar botes de basura*',
                    ],
                },
            ],
            'footnotes': [
                '* Las bolsas de repuesto para basura son provistas por el cliente.',
                'Limpieza profunda de rieles de ventanas disponible como add-on.',
            ],
        },
    },
    'move_in_out': {
        'en': {
            'title': 'Move-In / Move-Out Cleaning Checklist',
            'tagline': 'A thorough clean of an empty home so it\'s ready for the next chapter.',
            'areas': [
                {
                    'name': 'Entryway',
                    'items': [
                        'Remove cobwebs',
                        'Wipe light switches, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, the front door and door frame',
                        'Dust blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Living, Family & TV Rooms',
                    'items': [
                        'Remove cobwebs',
                        'Wipe light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum under couch cushions',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Dining Room',
                    'items': [
                        'Remove cobwebs',
                        'Wipe light switches, furniture, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Kitchen',
                    'items': [
                        'Remove cobwebs',
                        'Sanitize sinks, faucets, countertops and backsplash',
                        'Wipe the stovetop, coffee maker, light switches, doorknobs, windowsills, light fixtures within reach and baseboards',
                        'Clean the outside of the dishwasher, refrigerator, stove and cabinet doors',
                        'Clean the microwave inside and out',
                        'Spot-clean walls, doors and door frames',
                        'Polish chrome faucets and fixtures',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Sweep and mop the floor',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Laundry Room',
                    'items': [
                        'Remove cobwebs',
                        'Sanitize the utility sink, faucet, countertops and backsplash',
                        'Wipe the rubber seals around the washer and dryer doors, light switches, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Clean the outside of the washer, dryer and cabinet doors',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Sweep and mop the floor',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Bathrooms',
                    'items': [
                        'Remove cobwebs',
                        'Sanitize the shower, shower caddy, bathtub, toilet, sinks, faucets, vanity tops and backsplash',
                        'Wipe towel bars, light switches, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Clean the outside of vanity doors',
                        'Spot-clean walls, doors and door frames',
                        'Polish chrome faucets and fixtures',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Sweep and mop the floor',
                        'Take out all trash',
                    ],
                },
                {
                    'name': 'Bedrooms',
                    'items': [
                        'Remove cobwebs',
                        'Wipe light switches, windowsills, mirrors, light fixtures within reach and baseboards',
                        'Spot-clean walls, doors and door frames',
                        'Dust ceiling fans, blinds and A/C and heating vents',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Take out all trash',
                    ],
                },
            ],
            'footnotes': [
                'Deep cleaning of window tracks is available as an add-on.',
            ],
        },
        'es': {
            'title': 'Checklist de Limpieza de Entrada / Salida (Mudanzas)',
            'tagline': 'Una limpieza exhaustiva de una casa vacía para dejarla lista para la siguiente etapa.',
            'areas': [
                {
                    'name': 'Entrada / Recibidor',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar interruptores, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puerta principal y marco',
                        'Desempolvar persianas y rejillas de ventilación y calefacción',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Sala de Estar, Familiar y TV',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar debajo de los cojines de sofá',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Comedor',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar interruptores, muebles, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Cocina',
                    'items': [
                        'Eliminar telarañas',
                        'Desinfectar fregaderos, grifos, encimeras y salpicaderos',
                        'Limpiar estufa, cafetera, interruptores, manijas, alféizares, lámparas al alcance y rodapiés',
                        'Limpiar exterior del lavavajillas, refrigerador, estufa y puertas de gabinetes',
                        'Limpiar microondas por dentro y por fuera',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Pulir grifos y accesorios cromados',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Barrer y trapear el piso',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Cuarto de Lavado',
                    'items': [
                        'Eliminar telarañas',
                        'Desinfectar lavadero utilitario, grifo, encimeras y salpicadero',
                        'Limpiar sellos de goma de lavadora/secadora, interruptores, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpiar exterior de lavadora, secadora y puertas de gabinetes',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Barrer y trapear el piso',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Baños',
                    'items': [
                        'Eliminar telarañas',
                        'Desinfectar ducha, organizador, bañera, inodoro, lavamanos, grifos, tocador y salpicadero',
                        'Limpiar toalleros, interruptores, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpiar exterior de puertas del tocador',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Pulir grifos y accesorios cromados',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Barrer y trapear el piso',
                        'Sacar toda la basura',
                    ],
                },
                {
                    'name': 'Dormitorios',
                    'items': [
                        'Eliminar telarañas',
                        'Limpiar interruptores, alféizares, espejos, lámparas al alcance y rodapiés',
                        'Limpieza puntual de paredes, puertas y marcos',
                        'Desempolvar ventiladores de techo, persianas y rejillas',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Sacar toda la basura',
                    ],
                },
            ],
            'footnotes': [
                'Limpieza profunda de rieles de ventanas disponible como add-on.',
            ],
        },
    },
    'str_turnover': {
        'en': {
            'title': 'Short-Term Rental Turnover Checklist',
            'tagline': 'A fast, 5-star reset between guests so every arrival matches your listing presentation.',
            'areas': [
                {
                    'name': 'Bedrooms',
                    'items': [
                        'Strip beds and bag used linens',
                        'Remake beds with fresh linens, hotel-style',
                        'Wipe nightstands, dressers, lamps and mirrors',
                        'Dust ceiling fans and light fixtures within reach',
                        'Check under beds and inside drawers for left-behind items',
                        'Vacuum carpets or sweep and mop hard floors',
                        'Restyle decorative pillows and throws to match listing photos',
                    ],
                },
                {
                    'name': 'Bathrooms',
                    'items': [
                        'Scrub, sanitize and disinfect toilet, shower, tub and sink',
                        'Polish mirrors and chrome fixtures streak-free',
                        'Neatly fold and display fresh towels',
                        'Restock guest amenities (toilet paper, soap, shampoo)',
                        'Sweep and mop floors, empty trash',
                        'Inspect and report any damage or maintenance issues',
                    ],
                },
                {
                    'name': 'Kitchen',
                    'items': [
                        'Wash, dry and put away guest dishes',
                        'Sanitize countertops, sink, faucet and backsplash',
                        'Clean microwave inside and out',
                        'Inspect refrigerator and clear any guest leftovers',
                        'Restock supplies (dish soap, sponge, paper towels)',
                        'Sweep, mop and empty trash',
                    ],
                },
                {
                    'name': 'Living & Dining Areas',
                    'items': [
                        'Straighten sofa cushions and throws',
                        'Dust surfaces, media consoles and décor',
                        'Sanitize high-touch items, remotes and controllers',
                        'Clean TV screen and glass streak-free',
                        'Vacuum carpets or mop hard floors',
                        'Empty all trash bins and replace liners',
                    ],
                },
                {
                    'name': 'Linen Service',
                    'items': [
                        'In-unit laundry: wash and dry linens on site ($0.00 included)',
                        'Off-site laundry (if added): complete external laundering, sanitizing & folding',
                    ],
                },
            ],
            'footnotes': [
                'Standard turnover includes in-unit laundering of 1 sheet set + towels per bedroom.',
                'Off-site laundry add-on covers full external laundering for tight turnover windows.',
            ],
        },
        'es': {
            'title': 'Checklist de Rotación de Alquiler Temporal (Airbnb / VRBO)',
            'tagline': 'Una rotación 5 estrellas entre huéspedes para que cada llegada luzca como en tus fotos.',
            'areas': [
                {
                    'name': 'Dormitorios',
                    'items': [
                        'Retirar sábanas usadas y embolsar ropa blanca',
                        'Tender camas con sábanas limpias estilo hotelero',
                        'Limpiar mesas de noche, cómodas, lámparas y espejos',
                        'Desempolvar ventiladores y lámparas al alcance',
                        'Revisar debajo de camas y cajones por objetos olvidados',
                        'Aspirar alfombras o barrer y trapear pisos duros',
                        'Acomodar cojines decorativos y mantas según el anuncio',
                    ],
                },
                {
                    'name': 'Baños',
                    'items': [
                        'Fregar, sanitizar y desinfectar inodoro, ducha, bañera y lavamanos',
                        'Pulir espejos y accesorios cromados sin marcas',
                        'Doblar y disponer toallas limpias ordenadamente',
                        'Reabastecer amenidades para huéspedes (papel, jabón, shampoo)',
                        'Barrer, trapear y vaciar basura',
                        'Inspeccionar y reportar daños o problemas de mantenimiento',
                    ],
                },
                {
                    'name': 'Cocina',
                    'items': [
                        'Lavar, secar y guardar vajilla de huéspedes',
                        'Desinfectar encimeras, fregadero, grifo y salpicadero',
                        'Limpiar microondas por dentro y por fuera',
                        'Revisar refrigerador y desechar alimentos perecederos dejados',
                        'Reabastecer insumos (jabón de platos, esponja, toallas de papel)',
                        'Barrer, trapear y vaciar basura',
                    ],
                },
                {
                    'name': 'Sala de Estar y Comedor',
                    'items': [
                        'Acomodar cojines de sofás y mantas',
                        'Desempolvar mesas, consolas y decoración',
                        'Desinfectar puntos de contacto, controles remotos y mandos',
                        'Limpiar pantalla de TV y vidrios sin marcas',
                        'Aspirar alfombras o trapear pisos',
                        'Vaciar todos los basureros y reponer bolsas',
                    ],
                },
                {
                    'name': 'Servicio de Ropa Blanca',
                    'items': [
                        'Lavado en la unidad: lavado y secado en máquinas de la propiedad ($0.00 incluido)',
                        'Lavandería externa (si fue contratada): retiro, lavado profesional, doblado y reposición',
                    ],
                },
            ],
            'footnotes': [
                'La rotación estándar incluye lavado en la unidad de 1 juego de sábanas + toallas por habitación.',
                'El add-on de lavandería externa cubre lavado profesional externo para tiempos de rotación reducidos.',
            ],
        },
    },
}

# -----------------------------------------------------------------------------
# General "Please Note" (Floors, Blinds, Radiators) from Page 3/5
# -----------------------------------------------------------------------------

GPC_PLEASE_NOTE = {
    'en': {
        'title': 'Important Service Notes',
        'items': [
            (
                'Floors',
                'Floors are vacuumed and mopped only. If your floors need scrubbing, stripping or waxing, please let our office know before your cleaning so we can plan for it.'
            ),
            (
                'Blinds',
                'Blinds are wiped and dusted with a duster. If they need a full, detailed washing, let us know and we\'ll provide an estimated cost and time. (Some blinds must be taken down and washed in a tub; we cannot be held responsible for damage to old or brittle blinds during washing).'
            ),
            (
                'Radiators',
                'We wipe accessible radiator areas with a degreaser to remove dust and vacuum underneath and behind where safe. A complete radiator overhaul is not guaranteed.'
            ),
        ],
    },
    'es': {
        'title': 'Notas Importantes del Servicio',
        'items': [
            (
                'Pisos',
                'Los pisos se aspiran y trapean únicamente. Si tus pisos requieren fregado profundo mecánico, decapado o encerado, infórmanos antes de la cita para planificarlo.'
            ),
            (
                'Persianas',
                'Las persianas se limpian y sacuden con plumero. Si requieren un lavado integral detallado, avísanos para darte un estimado de costo y tiempo.'
            ),
            (
                'Radiadores',
                'Limpiamos áreas accesibles con desengrasante para remover polvo y aspiramos debajo y detrás donde sea seguro. No se garantiza una limpieza técnica completa de radiadores.'
            ),
        ],
    },
}

# -----------------------------------------------------------------------------
# "How to Prepare for Your Cleaning" from Page 6
# -----------------------------------------------------------------------------

GPC_PREPARATION = {
    'en': {
        'title': 'How to Prepare for Your Cleaning',
        'subtitle': 'A few quick steps before our arrival help our team deliver maximum results.',
        'general_title': 'For All Services',
        'general_tips': [
            ('Pick up clutter', 'Put away clothes, toys, papers, and dishes so our team can spend their time cleaning, not organizing.'),
            ('Secure your pets', 'Please keep pets in a closed room or crate, or let us know in advance if they will be loose.'),
            ('Make sure we can get in', 'If you won\'t be home, share entry instructions (door code, lockbox, key location, gate or parking details) before your appointment.'),
            ('Put away valuables', 'Store jewelry, cash, medications, and important documents in a safe place.'),
            ('Tell us your priorities', 'Is there an area you want us to focus on, or something we should avoid? Reply to this email or tell our team when we arrive.'),
            ('Mention any special surfaces', 'Let us know about natural stone, hardwood, or delicate items that need special care.'),
            ('Water and electricity', 'Please make sure both are working, since we need them to clean.'),
        ],
        'specific_titles': {
            'standard': 'Standard Cleaning Preparation',
            'deep': 'Deep Cleaning Preparation',
            'move_in_out': 'Move-In / Move-Out Preparation',
            'str_turnover': 'Short-Term Rental Preparation',
        },
        'specific_tips': {
            'standard': [
                'Clear countertops, tables, and nightstands as much as possible so we can clean the surfaces.',
                'Place dirty dishes in the dishwasher or sink. (Hand-washing dishes is not included).',
                'Leave fresh linens on the bed if you\'d like us to change your sheets.',
            ],
            'deep': [
                'Plan for a longer visit. A deep clean takes more time than a regular cleaning, especially the first time.',
                'Clear windowsills, shelves, and baseboard areas so we can reach them.',
                'Move fragile items or collectibles you prefer to handle yourself.',
                'If you\'ve added extras like the inside of the oven or refrigerator, please empty the refrigerator before we arrive.',
            ],
            'move_in_out': [
                'The home should be empty. Please remove all furniture, boxes, and belongings before we arrive. Items left behind can limit what we\'re able to clean.',
                'Water and electricity must be on. We can\'t complete the cleaning without them.',
                'Empty all cabinets, closets, and drawers so we can clean inside them if requested.',
                'Leave the refrigerator and appliances empty, with the refrigerator plugged in.',
                'Share access details for the building, garage, gate or lockbox in advance.',
                'Moving out? Ask your landlord or property manager for their move-out checklist and send it to us. We\'ll do our best to match it.',
            ],
            'str_turnover': [
                'Ensure keypad code, smart lock, or lockbox access is operational.',
                'Leave guest supplies, toilet paper, paper towels, and extra linens in the designated owner closet.',
                'Confirm checkout time of outgoing guests and expected arrival window for incoming guests.',
            ],
        },
        'reschedule_title': 'Need to Reschedule?',
        'reschedule_text': 'Please let us know at least 24 hours in advance by calling or texting (720) 590-8632 or emailing info@gopropertycare.com.',
    },
    'es': {
        'title': 'Cómo Prepararte para tu Limpieza',
        'subtitle': 'Unos sencillos pasos antes de nuestra llegada ayudan a nuestro equipo a lograr el mejor resultado.',
        'general_title': 'Para Todos los Servicios',
        'general_tips': [
            ('Recoge el desorden', 'Guarda ropa, juguetes, papeles y platos para que nuestro equipo pueda enfocarse en limpiar y no en organizar.'),
            ('Asegura a tus mascotas', 'Por favor mantén a tus mascotas en una habitación cerrada o transportadora, o avísanos si estarán sueltas.'),
            ('Asegura el acceso', 'Si no estarás en casa, comparte las instrucciones de entrada (código de puerta, lockbox, ubicación de llaves o estacionamiento) antes de tu cita.'),
            ('Guarda objetos de valor', 'Resguarda joyas, dinero en efectivo, medicamentos y documentos importantes en un lugar seguro.'),
            ('Cuéntanos tus prioridades', '¿Hay alguna zona en la que quieras que nos enfoquemos o algo que debamos evitar? Responde a este correo o infórmale a nuestro equipo al llegar.'),
            ('Menciona superficies especiales', 'Infórmanos sobre mármol, piedra natural o madera que requieran productos específicos.'),
            ('Agua y electricidad', 'Por favor asegúrate de que ambos servicios estén funcionando, ya que los necesitamos para limpiar.'),
        ],
        'specific_titles': {
            'standard': 'Preparación para Limpieza Estándar',
            'deep': 'Preparación para Limpieza Profunda',
            'move_in_out': 'Preparación para Limpieza de Entrada / Salida (Mudanza)',
            'str_turnover': 'Preparación para Rotación de Alquiler Temporal',
        },
        'specific_tips': {
            'standard': [
                'Despeja encimeras, mesas y mesitas de noche tanto como sea posible para que podamos limpiar las superficies.',
                'Coloca los platos sucios en el lavavajillas o fregadero. (Lavar platos a mano no está incluido).',
                'Deja sábanas limpias sobre la cama si deseas que cambiemos tu ropa de cama.',
            ],
            'deep': [
                'Planifica una visita más larga: Una limpieza profunda toma más tiempo que una regular, especialmente la primera vez.',
                'Despeja alféizares, repisas y zonas de zócalos/rodapiés para que podamos alcanzarlos.',
                'Mueve objetos frágiles o coleccionables que prefieras manipular personalmente.',
                'Si contrataste extras como el interior del horno o refrigerador, por favor vacía el refrigerador antes de nuestra llegada.',
            ],
            'move_in_out': [
                'La propiedad debe estar vacía: Por favor retira muebles, cajas y pertenencias antes de que lleguemos. Objetos dejados pueden limitar lo que podamos limpiar.',
                'El agua y la electricidad deben estar activas: No podemos completar la limpieza sin ellas.',
                'Vacía todos los gabinetes, armarios y cajones para que podamos limpiar su interior si fue solicitado.',
                'Deja el refrigerador y electrodomésticos vacíos y el refrigerador conectado.',
                'Comparte con anticipación los códigos de acceso al edificio, portón o lockbox.',
                '¿Entrega de arriendo? Pide a tu arrendador o administrador su checklist de entrega y envíanoslo. Haremos todo lo posible por cumplirlo.',
            ],
            'str_turnover': [
                'Verifica que el código de la cerradura inteligente, teclado o lockbox funcione correctamente.',
                'Deja suministros para huéspedes, toallas y sábanas limpias en el closet de suministros designado.',
                'Confirma la hora de salida de los huéspedes anteriores y la llegada de los próximos huéspedes.',
            ],
        },
        'reschedule_title': '¿Necesitas Reprogramar?',
        'reschedule_text': 'Por favor avísanos con al menos 24 horas de anticipación llamando o enviando un mensaje de texto al (720) 590-8632 o a info@gopropertycare.com.',
    },
}


# -----------------------------------------------------------------------------
# Resolver Helper
# -----------------------------------------------------------------------------

def resolve_gpc_service_key(order) -> str:
    """
    Deterministically determines the service category key ('standard', 'deep', 'move_in_out', 'str_turnover')
    from the order's service_rate, name, and special instructions.
    """
    rate = getattr(order, 'service_rate', None)
    st = (getattr(rate, 'service_type', '') or '').lower()
    name = (getattr(rate, 'name', '') or '').lower()
    instructions = (getattr(order, 'special_instructions', '') or '').lower()

    if any(k in st for k in ['move_in', 'movein']) or 'move-in' in name or 'move in' in name or 'move_in_out' in instructions:
        return 'move_in_out'
    if 'deep' in st or 'deep' in name or 'profunda' in name:
        return 'deep'
    if any(k in st for k in ['str', 'short_term', 'rental']) or 'str' in name or 'short-term' in name or 'airbnb' in name or 'turnover' in name:
        return 'str_turnover'
    return 'standard'


# -----------------------------------------------------------------------------
# HTML & Plain-Text Renderers
# -----------------------------------------------------------------------------

def render_gpc_email_sections(order, is_spanish: bool = False):
    """
    Generates both HTML and plain-text blocks containing:
    1. Service Checklist (What's included in each room/area)
    2. General Notes (Floors, blinds, radiators, trash liners)
    3. How to Prepare for Your Cleaning (General tips + service-specific tips + rescheduling)
    """
    lang_key = 'es' if is_spanish else 'en'
    service_key = resolve_gpc_service_key(order)

    checklist_data = GPC_CHECKLISTS.get(service_key, GPC_CHECKLISTS['standard'])[lang_key]
    notes_data = GPC_PLEASE_NOTE[lang_key]
    prep_data = GPC_PREPARATION[lang_key]

    service_title = checklist_data['title']
    service_tagline = checklist_data['tagline']
    areas = checklist_data['areas']
    footnotes = checklist_data.get('footnotes', [])

    # -------------------------------------------------------------------------
    # 1. Plain Text Block
    # -------------------------------------------------------------------------
    text_lines = []
    text_lines.append("")
    text_lines.append("=========================================")
    official_label = "CHECKLIST OFICIAL" if is_spanish else "OFFICIAL SERVICE CHECKLIST"
    text_lines.append(f"{official_label}: {service_title.upper()}")
    text_lines.append(f"{service_tagline}")
    text_lines.append("=========================================")

    for area in areas:
        text_lines.append(f"\n[{area['name']}]")
        for item in area['items']:
            text_lines.append(f"  • {item}")

    if footnotes:
        fn_header = "Notas de Servicio:" if is_spanish else "Service Notes:"
        text_lines.append(f"\n{fn_header}")
        for fn in footnotes:
            text_lines.append(f"  {fn}")

    text_lines.append("\n-----------------------------------------")
    text_lines.append(f"{notes_data['title'].upper()}:")
    for k, v in notes_data['items']:
        text_lines.append(f"• {k}: {v}")

    text_lines.append("\n=========================================")
    text_lines.append(f"{prep_data['title'].upper()}")
    text_lines.append(f"{prep_data['subtitle']}")
    text_lines.append("=========================================")

    text_lines.append(f"\n[{prep_data['general_title']}]")
    for k, v in prep_data['general_tips']:
        text_lines.append(f"• {k}: {v}")

    specific_title = prep_data['specific_titles'].get(service_key, '')
    specific_tips = prep_data['specific_tips'].get(service_key, [])
    if specific_tips:
        text_lines.append(f"\n[{specific_title}]")
        for tip in specific_tips:
            text_lines.append(f"• {tip}")

    text_lines.append(f"\n{prep_data['reschedule_title']}")
    text_lines.append(f"{prep_data['reschedule_text']}")
    text_lines.append("=========================================\n")

    plain_text_block = "\n".join(text_lines)

    # -------------------------------------------------------------------------
    # 2. HTML Block (Inline CSS, Responsive Table Layout for Email Clients)
    # -------------------------------------------------------------------------
    areas_html = ""
    for area in areas:
        items_li = "".join([
            f"<li style='margin-bottom: 4px; color: #334155; font-size: 13px; line-height: 1.5;'>{item}</li>"
            for item in area['items']
        ])
        areas_html += f"""
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;">
          <div style="font-weight: 800; color: #166534; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 8px;"></span>
            {area['name']}
          </div>
          <ul style="margin: 0; padding-left: 20px;">
            {items_li}
          </ul>
        </div>
        """

    footnotes_html = ""
    if footnotes:
        fn_items = "".join([f"<p style='margin: 4px 0; font-size: 11px; color: #64748b; font-style: italic;'>{fn}</p>" for fn in footnotes])
        footnotes_html = f"<div style='margin-top: 10px; padding: 8px 12px; background-color: #f1f5f9; border-radius: 8px;'>{fn_items}</div>"

    notes_items_html = ""
    for title_note, desc_note in notes_data['items']:
        notes_items_html += f"""
        <div style="margin-bottom: 8px;">
          <strong style="color: #0f172a; font-size: 12px;">{title_note}:</strong>
          <span style="color: #475569; font-size: 12px; line-height: 1.5;"> {desc_note}</span>
        </div>
        """

    general_prep_html = ""
    for title_tip, desc_tip in prep_data['general_tips']:
        general_prep_html += f"""
        <li style="margin-bottom: 6px; font-size: 13px; line-height: 1.5; color: #334155;">
          <strong style="color: #0f172a;">{title_tip}:</strong> {desc_tip}
        </li>
        """

    specific_prep_html = ""
    if specific_tips:
        specific_items_li = "".join([
            f"<li style='margin-bottom: 6px; font-size: 13px; line-height: 1.5; color: #14532d;'>{tip}</li>"
            for tip in specific_tips
        ])
        specific_prep_html = f"""
        <div style="margin-top: 14px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px;">
          <div style="font-weight: 800; color: #166534; font-size: 13px; margin-bottom: 8px;">
            ★ {specific_title}
          </div>
          <ul style="margin: 0; padding-left: 20px;">
            {specific_items_li}
          </ul>
        </div>
        """

    html_block = f"""
    <!-- SERVICE CHECKLIST CARD -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px; background-color: #f8fafc; border: 2px solid #bbf7d0; border-radius: 14px; overflow: hidden;">
      <tr>
        <td style="background-color: #166534; padding: 16px 20px; color: #ffffff;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #86efac; margin-bottom: 4px;">
            {'ESTÁNDAR OFICIAL DE CALIDAD' if is_spanish else 'OFFICIAL QUALITY STANDARD'}
          </div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff;">
            {service_title}
          </h3>
          <p style="margin: 4px 0 0; font-size: 12px; color: #dcfce7; line-height: 1.4;">
            {service_tagline}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 16px 12px;">
          <div style="margin-bottom: 12px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
            {'¿QUÉ INCLUYE ESTE SERVICIO EN CADA HABITACIÓN?' if is_spanish else 'WHAT IS INCLUDED IN EACH ROOM?'}
          </div>
          {areas_html}
          {footnotes_html}

          <!-- Important notes: Floors, blinds, radiators -->
          <div style="margin-top: 14px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px;">
            <div style="font-weight: 800; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              ⚠ {notes_data['title']}
            </div>
            {notes_items_html}
          </div>
        </td>
      </tr>
    </table>

    <!-- HOW TO PREPARE CARD -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 24px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; overflow: hidden;">
      <tr>
        <td style="background-color: #0f172a; padding: 16px 20px; color: #ffffff;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; margin-bottom: 4px;">
            {'GUÍA DE PREPARACIÓN' if is_spanish else 'PREPARATION GUIDELINES'}
          </div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ffffff;">
            {prep_data['title']}
          </h3>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
            {prep_data['subtitle']}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 16px 14px;">
          <div style="font-weight: 800; color: #334155; font-size: 13px; margin-bottom: 8px;">
            {prep_data['general_title']}:
          </div>
          <ul style="margin: 0; padding-left: 20px;">
            {general_prep_html}
          </ul>

          {specific_prep_html}

          <!-- Reschedule Notice -->
          <div style="margin-top: 14px; background-color: #f1f5f9; border-left: 4px solid #059669; border-radius: 6px; padding: 12px 14px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 12px; margin-bottom: 2px;">
              📞 {prep_data['reschedule_title']}
            </div>
            <div style="color: #475569; font-size: 12px; line-height: 1.5;">
              {prep_data['reschedule_text']}
            </div>
          </div>
        </td>
      </tr>
    </table>
    """

    return plain_text_block, html_block
