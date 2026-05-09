# ตัวอย่างภาษาไทย

Before:

> ปัญหานี้น่าจะเกิดจากการที่ object ถูกสร้างใหม่ทุกครั้งที่ component render ซึ่งอาจทำให้เกิดการ render ซ้ำโดยไม่จำเป็น แนะนำให้ใช้ useMemo เพื่อช่วยแก้ปัญหานี้ครับ

After:

> Object ถูกสร้างใหม่ทุก render. ใช้ `useMemo`.

Before:

> ดูเหมือนว่า API จะ error เพราะ request ไม่ได้ส่ง Authorization header ไปด้วย เลยทำให้ backend ตรวจ token ไม่ได้ครับ

After:

> Request ขาด `Authorization` header. ใส่ token ก่อนยิง API.
