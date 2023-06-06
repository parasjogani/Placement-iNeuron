import User from "../models/user.schema.js"
import Product from "../models/product.schema.js"
import Cart from "../models/cart.schema.js"
import Coupon from "../models/coupon.schema.js"
import asyncHandler from "../services/asyncHandler.js"
import CustomError from "../utils/customError.js"
import mailHelper from "../utils/mailHelper.js"
import crypto from "crypto"


export const cookieOption = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 1000),
    httpOnly: true
}

/**************************************************
 * @SIGNUP
 * @route http://localhost:4000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @parameters name, email, password
 * @returns User Object
 **************************************************/

export const signUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new CustomError("Please fill all details", 400)
    }

    //check user already exist or not
    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new CustomError("User already exist", 400)
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const token = user.getJwtToken()
    user.password = undefined

    res.cookie("token", token, cookieOption)
    res.status(200).json({
        success: true,
        token,
        user
    })
})

/**************************************************
 * @LOGIN
 * @route http://localhost:4000/api/auth/login
 * @description User signIn Controller for loging new user
 * @parameters email, password
 * @returns User Object
 **************************************************/

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new CustomError("Please fill all details", 400)
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        throw new CustomError("Invalid credentials", 400)
    }

    const isPasswordMatched = await user.comparePassword(password)
    if (isPasswordMatched) {
        const token = user.getJwtToken()
        user.password = undefined;
        res.cookie("token", token, cookieOption)
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }

    throw new CustomError("Invalid credentials", 400)

})
/**************************************************
 * @ADMIN_LOGIN
 * @route http://localhost:4000/api/auth/admin-login
 * @description Admin signIn Controller for loging
 * @parameters email, password
 * @returns User Object
 **************************************************/

export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new CustomError("Please fill all details", 400)
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        throw new CustomError("Invalid credentials", 400)
    }

    if (user.role !== "ADMIN") {
        throw new CustomError("Not Authorized")
    }

    const isPasswordMatched = await user.comparePassword(password)
    if (isPasswordMatched) {
        const token = user.getJwtToken()
        user.password = undefined;
        res.cookie("token", token, cookieOption)
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }

    throw new CustomError("Invalid credentials", 400)

})

/**************************************************
 * @LOGOUT
 * @route http://localhost:4000/api/auth/logout
 * @description User logout by clearing user cookies
 * @parameters
 * @returns success message
 **************************************************/

export const logout = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logout successfully"
    })
})

/**************************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:4000/api/auth/password/forgot
 * @description User will submit email and we will generate a token
 * @parameters email
 * @returns success message - email - send
 **************************************************/

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (email == "") {
        throw new CustomError("Please enter valid email", 400)
    }
    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomError("User not found", 404)
    }
    const resetToken = user.generateForgotPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetUrl =
        `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`

    const text = `Tap the below link to reset your password
    \n\n ${resetUrl}\n\n
    `
    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset mail",
            text: text
        })
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({ validateBeforeSave: false })

        throw new CustomError(error.message || "Something went wrong", 500)
    }
})

/**************************************************
 * @RESET_PASSWORD
 * @route http://localhost:4000/api/auth/password/reset/:resetToken
 * @description User will be able to reset password based on url token
 * @parameters token from url, password and confirm password
 * @returns User Object
 **************************************************/

export const resetPassword = asyncHandler(async (req, res) => {
    const { token: resetToken } = req.params
    const { password, confirmpassword } = req.body

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new CustomError("password token is invalid", 400)
    }

    if (password !== confirmpassword) {
        throw new CustomError("both password not matched", 400)
    }

    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    await user.save()

    //create token and send as response
    const token = user.getJwtToken()
    user.password = undefined

    //helper method for cookie can be added
    res.cookie("token", token, cookieOption)
    res.status(200).json({
        success: true,
        user
    })
})

/**************************************************
 * @GET_PROFILE
 * @REQUEST_TYPE GET
 * @route http://localhost:4000/api/auth/profile
 * @description Check for token and populate req.user
 * @parameters 
 * @returns User Object
 **************************************************/

export const getProfile = asyncHandler(async (req, res) => {
    const { user } = req

    if (!user) {
        throw new CustomError("User not found", 404)
    }
    res.status(200).json({
        success: true,
        user
    })
})

/**************************************************
 * @GET_All_USER
 * @REQUEST_TYPE GET
 * @route http://localhost:4000/api/auth/all-user
 * @description Check all registred user
 * @parameters 
 * @returns User Object
 **************************************************/

export const getAllUser = asyncHandler(async (req, res) => {
    const getAllUsers = await User.find().populate("wishlist")
    if (!getAllUsers) {
        throw new CustomError("Users not found", 404)
    }
    res.json(getAllUsers)
})

/**************************************************
 * @CHANGE_PASSWORD
 * @route http://localhost:4000/api/auth/password/changepassword
 * @description User will be able to changed password, need to enter old correct password
 * @parameters old password, password and confirm password
 * @returns User Object
 **************************************************/

export const changePassword = asyncHandler(async (req, res) => {
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body

    const user = await User.findOne({ email }).select("+password")
    const isOldPasswordMatched = await user.comparePassword(oldPassword)
    console.log(isOldPasswordMatched);
    if (!isOldPasswordMatched) {
        throw new CustomError("Invalid credentials")
    }

    if (newPassword !== confirmNewPassword) {
        throw new CustomError("Password does not matched")
    }

    user.password = newPassword
    await user.save()

    const token = user.getJwtToken()
    user.password = undefined

    res.cookie("token", token, cookieOption)
    res.status(200).json({
        success: true,
        user
    })
})

/**************************************************
 * @BLOCK_USER
 * @route http://localhost:4000/api/auth/block-user/:id
 * @description Admin will be able to block user
 * @parameters userid
 * @returns User Object
 **************************************************/

export const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    const block = await User.findByIdAndUpdate(
        id,
        {
            isBlocked: true
        },
        {
            new: true
        }
    )
    res.status(200).json({
        success: true,
        message: "User Blocked"
    })
})

/**************************************************
 * @UNBLOCK_USER
 * @route http://localhost:4000/api/auth/unblock-user/:id
 * @description Admin will be able to unblock user
 * @parameters userid
 * @returns User Object
 **************************************************/

export const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    const block = await User.findByIdAndUpdate(
        id,
        {
            isBlocked: false
        },
        {
            new: true
        }
    )
    res.status(200).json({
        success: true,
        message: "User Unblocked"
    })
})

/**************************************************
 * @GET_WISHLIST
 * @route http://localhost:4000/api/auth/wishlist
 * @description User can get all wishlisted item
 * @parameters 
 * @returns User Object
 **************************************************/

export const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).populate("wishlist")

    res.status(200).json({
        success: true,
        message: "Wishlist got successfully",
        user
    })

})

/**************************************************
 * @ADD_ADDRESS
 * @route http://localhost:4000/api/auth/add-address
 * @description User can add address
 * @parameters 
 * @returns User Object
 **************************************************/

export const addAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user

    const updatedUser = await User.findByIdAndUpdate(_id, {
        address: req.body.address
    },
        {
            new: true
        }
    )
    res.status(200).json({
        success: true,
        message: "Address added successfully",
        updatedUser
    })
})

/**************************************************
 * @ADD_TO_CART
 * @route http://localhost:4000/api/auth/cart
 * @description User can add product in cart
 * @parameters 
 * @returns Cart Object
 **************************************************/

export const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body
    const { _id } = req.user
    let products = []
    const user = await User.findById(_id)

    const alreadyAdded = await Cart.findOne({ orderby: user._id })
    if (alreadyAdded) {
        alreadyAdded.remove()
    }

    for (let i = 0; i < cart.length; i++) {
        let object = {}
        object.product = cart[i]._id
        object.count = cart[i].count

        let getPrice = await Product.findById(cart[i]._id).select("price").exec()
        object.price = getPrice.price
        products.push(object)
    }

    let cartTotal = 0
    for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count
    }

    let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user._id
    })
    newCart.save()
    res.status(200).json({
        success: true,
        newCart
    })
})

/**************************************************
 * @GET_CART_PRODUCTS
 * @route http://localhost:4000/api/auth/cart
 * @description User can get product which is in cart
 * @parameters 
 * @returns Cart Object
 **************************************************/

export const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user

    const cart = await Cart.findOne({ orderby: _id }).populate("products.product")
    res.status(200).json({
        success: true,
        cart
    })
})

/**************************************************
 * @EMPTY_CART_PRODUCTS
 * @route http://localhost:4000/api/auth/empty-cart
 * @description User can get product which is in cart
 * @parameters 
 * @returns Cart Object
 **************************************************/

export const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user

    const user = await User.findOne({ _id })
    const cart = await Cart.findOneAndRemove({ orderby: user._id })
    res.status(200).json({
        success: true,
        cart
    })
})

/**************************************************
 * @APPLY_COUPON
 * @route http://localhost:4000/api/auth/apply-coupon
 * @description User can get product which is in cart
 * @parameters 
 * @returns Cart Object
 **************************************************/

export const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body
    const { _id } = req.user
    const isValid = await Coupon.findOne({ code: coupon })

    if (isValid === null) {
        throw new CustomError("Coupon is invalid", 400)
    }

    const user = await User.findOne({ _id })
    let { products, cartTotal } = await Cart.findOne({ orderby: user._id }).populate("products.product")
    let totalAfterDiscount = (cartTotal - (cartTotal * isValid.discount) / 100).toFixed(2)
    await Cart.findOneAndUpdate({
        orderby: user._id
    },
        {
            totalAfterDiscount
        },
        {
            new: true
        })
    res.status(200).json({
        success: true,
        totalAfterDiscount
    })



})

