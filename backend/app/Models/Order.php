<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $customer_name
 * @property string $phone
 * @property string $wilaya
 * @property string $commune
 * @property string|null $address_details
 * @property string $status
 * @property float $subtotal
 * @property float $shipping_cost
 * @property float $total
 * @property string $payment_status
 * @property string $payment_method
 * @property string|null $tracking_number
 * @property string|null $delivery_time
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static> pending()
 * @method static \Illuminate\Database\Eloquent\Builder<static> paid()
 * @method static \Illuminate\Database\Eloquent\Builder<static> where(string $column, mixed $value = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static> whereDate(string $column, mixed $value)
 * @method static \Illuminate\Database\Eloquent\Builder<static> latest()
 * @method static static create(array $attributes)
 * @method static mixed count()
 * @method static mixed sum(string $column)
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'phone',
        'wilaya',
        'commune',
        'address_details',
        'status',
        'subtotal',
        'shipping_cost',
        'total',
        'payment_status',
        'payment_method',
        'tracking_number',
        'delivery_time',
        'notes',
    ];

    protected $casts = [
        'subtotal'      => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total'         => 'decimal:2',
        'delivery_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }
}
