<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','accepted','rejected','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('user_id');
            $table->string('phone')->nullable()->after('customer_name');
            $table->string('wilaya')->nullable()->after('phone');
            $table->string('commune')->nullable()->after('wilaya');
            $table->text('address_details')->nullable()->after('commune');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'phone', 'wilaya', 'commune', 'address_details']);
        });

        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','accepted','rejected','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'");
    }
};
