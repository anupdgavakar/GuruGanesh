<?php

namespace App\Enums;

/**
 * The built-in role keys and the permission names. What each role can DO is
 * stored in the `roles` table (App\Models\Role) so admins can change it and
 * create new roles — this enum only names the fixed things the code itself
 * relies on: the customer account type, the admin role that can never be
 * locked out, and the list of permissions a role can be given.
 */
enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    /** The original shared "staff" role — kept so existing accounts work; hidden when adding people. */
    case Staff = 'staff';
    case Sales = 'sales';
    case Designer = 'designer';
    case Customer = 'customer';

    public const PERM_CATALOG = 'catalog';          // products, categories, brands and the other catalog lists
    public const PERM_CONTENT = 'content';          // slides, blog, services, testimonials, media
    public const PERM_ORDERS = 'orders';
    public const PERM_INQUIRIES = 'inquiries';      // contact messages and price requests
    public const PERM_DESIGN_FILES = 'design_files';
    public const PERM_SETTINGS = 'settings';
    public const PERM_USERS = 'users';              // team accounts and roles — admin only, never grantable
    public const PERM_ASSIGN = 'assign';            // hand a request to someone else
    public const PERM_DELETE = 'delete_records';    // delete orders and inquiries

    /**
     * Permissions a custom role may be given. "users" is left out on purpose:
     * whoever can create team accounts could give themselves the admin role.
     *
     * @return list<string>
     */
    public static function grantable(): array
    {
        return [
            self::PERM_CATALOG, self::PERM_CONTENT, self::PERM_ORDERS, self::PERM_INQUIRIES,
            self::PERM_DESIGN_FILES, self::PERM_SETTINGS, self::PERM_ASSIGN, self::PERM_DELETE,
        ];
    }

    /** @return list<string> */
    public static function all(): array
    {
        return [...self::grantable(), self::PERM_USERS];
    }
}
