# Bug Fix: Blog Status Field Data Truncation Error

## Issue
When creating or updating a blog post through the Filament admin panel, users encountered an SQL error:

```
SQLSTATE[01000]: Warning: 1265 Data truncated for column 'status' at row 1
```

## Root Cause
The `status` field in the blog creation form was defined as a `TextInput` component, which allowed users to enter any arbitrary text value. However, the database column was defined as an ENUM with only two allowed values:
- `draft`
- `published`

When a user typed any other value (like "dxfgd" in the reported case), MySQL would reject it or truncate it, causing the error.

## Solution
Changed the `status` field from a `TextInput` to a `Select` component with predefined options that match the database ENUM values.

### File Modified
`backend-laravel/app/Filament/Resources/BlogResource.php`

### Changes Made
**Before:**
```php
Forms\Components\TextInput::make('status')
    ->required(),
```

**After:**
```php
Forms\Components\Select::make('status')
    ->options([
        'draft' => 'Draft',
        'published' => 'Published',
    ])
    ->default('draft')
    ->required(),
```

## Benefits
1. ✅ Users can only select from valid options (Draft, Published)
2. ✅ No more SQL truncation errors
3. ✅ Better UX with a dropdown selector
4. ✅ Default value set to 'Draft' for new blogs
5. ✅ Form validation enforced at UI level

## Testing
1. Navigate to `/admin/blogs/create`
2. Fill in the blog form
3. The `Status` field should now be a dropdown with "Draft" and "Published" options
4. Select any option and submit
5. Blog should save without errors

## Related Files
- Database migration: `database/migrations/2026_01_17_094204_create_blogs_table.php`
- Model: `app/Models/Blog.php`
- API Controller: `app/Http/Controllers/Api/BlogController.php` (already uses correct status values)

## Notes
- The API controller was already correctly filtering by status='published', so this fix ensures the admin panel enforces the same constraint
- All existing blogs with valid status values ('draft' or 'published') are unaffected
