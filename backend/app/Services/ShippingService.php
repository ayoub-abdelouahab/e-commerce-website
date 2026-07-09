<?php

namespace App\Services;

class ShippingService
{
    const COST_NORTH = 500;
    const COST_HIGH_PLATEAUX = 600;
    const COST_SAHARA = 700;

    const NORTHERN_WILAYAS = [
        'Algiers', 'Blida', 'Oran', 'Constantine', 'Annaba', 'Tipaza',
        'Boumerdes', 'Chlef', 'Tizi Ouzou', 'Bejaia', 'Jijel', 'Skikda',
        'Mostaganem', 'Ain Temouchent', 'Mascara', 'Relizane', 'El Taref',
    ];

    const HIGH_PLATEAUX_WILAYAS = [
        'Setif', 'Batna', 'Bordj Bou Arreridj', 'Medea', 'Bouira',
        'Djelfa', 'Tiaret', 'Saida', 'Tlemcen', 'Sidi Bel Abbes',
        'Oum El Bouaghi', 'Khenchela', 'Tebessa', 'Souk Ahras',
        'Mila', 'Guelma', "M'Sila",
    ];

    const SAHARA_WILAYAS = [
        'Ouargla', 'Ghardaia', 'Biskra', 'El Oued', 'Adrar',
        'Tamanrasset', 'Illizi', 'Tindouf', 'Bechar', 'Laghouat',
        'Naama', 'El Bayadh', 'Touggourt', 'Djanet', 'In Salah',
        'In Guezzam', "El M'Ghair", 'Ouled Djellal', 'Timimoun',
        'Bordj Badji Mokhtar', 'Beni Abbes', 'El Meniaa',
    ];

    public static function getRegion(string $wilaya): ?string
    {
        if (in_array($wilaya, self::NORTHERN_WILAYAS, true)) return 'north';
        if (in_array($wilaya, self::HIGH_PLATEAUX_WILAYAS, true)) return 'high_plateaux';
        if (in_array($wilaya, self::SAHARA_WILAYAS, true)) return 'sahara';
        return null;
    }

    public static function getCost(string $wilaya): int
    {
        $region = self::getRegion($wilaya);

        return match ($region) {
            'north'         => self::COST_NORTH,
            'high_plateaux' => self::COST_HIGH_PLATEAUX,
            'sahara'        => self::COST_SAHARA,
            default         => self::COST_NORTH,
        };
    }

    public static function getRegionLabel(string $wilaya): string
    {
        $region = self::getRegion($wilaya);

        return match ($region) {
            'north'         => 'Northern',
            'high_plateaux' => 'High Plateaux',
            'sahara'        => 'Saharan',
            default         => 'Unknown',
        };
    }
}
