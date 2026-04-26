<?php

namespace App\Enums;

enum Amenity: string
{
    case AirConditioning = 'air_conditioning';
    case ShowerFacilities = 'shower_facilities';
    case WaitingArea = 'waiting_area';
    case Parking = 'parking';
    case WaterStation = 'water_station';
    case Cafeteria = 'cafeteria';
    case LockerRooms = 'locker_rooms';
    case Restrooms = 'restrooms';
    case ProShop = 'pro_shop';
    case EquipmentRental = 'equipment_rental';
    case NightLighting = 'night_lighting';
    case Scoreboard = 'scoreboard';
    case Seating = 'seating';
    case FirstAidKit = 'first_aid_kit';
    case Wifi = 'wifi';
    case CctvSecurity = 'cctv_security';
    case DrinkingFountain = 'drinking_fountain';
    case VendingMachines = 'vending_machines';
    case CoachingAvailable = 'coaching_available';
    case RefereeAvailable = 'referee_available';
    case ConvenienceStore = 'convenience_store';

    public function label(): string
    {
        return match ($this) {
            self::AirConditioning => 'Air Conditioning',
            self::ShowerFacilities => 'Shower Facilities',
            self::WaitingArea => 'Waiting Area',
            self::Parking => 'Parking',
            self::WaterStation => 'Water Station',
            self::Cafeteria => 'Cafeteria',
            self::LockerRooms => 'Locker Rooms',
            self::Restrooms => 'Restrooms',
            self::ProShop => 'Pro Shop',
            self::EquipmentRental => 'Equipment Rental',
            self::NightLighting => 'Night Lighting',
            self::Scoreboard => 'Scoreboard',
            self::Seating => 'Seating / Bleachers',
            self::FirstAidKit => 'First Aid Kit',
            self::Wifi => 'WiFi',
            self::CctvSecurity => 'CCTV Security',
            self::DrinkingFountain => 'Drinking Fountain',
            self::VendingMachines => 'Vending Machines',
            self::CoachingAvailable => 'Coaching Available',
            self::RefereeAvailable => 'Referee Available',
            self::ConvenienceStore => 'Mini Convenience Store',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $a) => ['value' => $a->value, 'label' => $a->label()],
            self::cases(),
        );
    }
}
