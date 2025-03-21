"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser, SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import ClientUserInfo from "../components/ClientUserInfo";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import CreateQuestion from "@/components/CreateQuestion";
import PlantUpdate from "@/components/PlantFile";

const formSchema = z.object({
  industry: z.string().nonempty("Industry is required"),
  major: z.string().nonempty("Major is required"),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      major: "",
    },
  });

  const { user } = useUser(); // For accessing the user object

  const [firestoreData, setFirestoreData] = useState(null); // State to store Firestore data
  const [loading, setLoading] = useState(false); // Loading state for data fetch
  const [newUser, setNewUser] = useState(false); // State to check if user is new

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.id);

      // First check if the user document already exists
      getDoc(userDocRef)
        .then((docSnap) => {
          const userData = {
            email: user.emailAddresses[0]?.emailAddress || "",
            fullname: `${user.firstName} ${user.lastName}` || "",
            lastLogin: new Date(),
          };

          if (docSnap.exists()) {
            // Document exists, update only the specific fields
            updateDoc(userDocRef, userData)
              .then(() => console.log("User data updated"))
              .catch((error) =>
                console.error("Error updating user data:", error)
              );
          } else {
            // Document doesn't exist, create it with default values
            setDoc(userDocRef, {
              ...userData,
              health: 5,
              plantLevel: 1,
              questionsAnswered: 0,
              createdAt: new Date(),
            })
              .then(() => console.log("New user created"))
              .catch((error) => console.error("Error creating user:", error));
          }
        })
        .catch((error) =>
          console.error("Error checking user document:", error)
        );
    }
  }, [user]); // Add user to dependency array to run when user changes

  return (
    <div className="min-h-screen">
      <div className="items-center justify-center flex-grow">
        <SignedIn>
          <Navbar />
          <div>
            <div className="flex items-center justify-between p-40 -mt-35">
              <div className="flex-1">
                <p
                  className="text-black-600 font-bold"
                  style={{ fontSize: "8vh" }}
                >
                  Welcome,
                </p>
                <p
                  className="font-bold -mt-12 bg-gradient-to-t from-green-600 to-green-100 text-transparent bg-clip-text"
                  style={{ fontSize: "15vh" }}
                >
                  {user?.firstName}
                </p>

                <p className="text-black-200" style={{ fontSize: "4vh" }}>
                  You haven't watered FINN today. <br></br>
                  Help FINN by practicing!
                </p>
                <br></br>

                <Link href="/question">
                  <button className="bg-green-200 text-black font-normal py-2 w-40 rounded-sm shadow-md hover:bg-green-300 transition duration-300">
                    Click to practice!
                  </button>
                </Link>
              </div>
              <div className="flex justify-center items-center">
                {/* <Image src="/p1s3.png" width={400} height={800} alt="Plant" /> */}
                <PlantUpdate width={350} height={740}/>
              </div>
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex justify-between bg-[#C1DEC3] min-h-screen items-center gap-8">
            <div className="absolute top-6 left-8 z-10">
              <h1 className="text-2xl font-bold text-black">
                plants vs. interview
              </h1>
            </div>
            <div className="flex-col p-8 rounded-lg">
              <h1 className="text-8xl font-semibold text-start mb-4">
                Grow your interviewing skills
                <span className="text-4xl text-start font-light italic block mt-2">
                  with our AI-powered interview assistant.
                </span>
              </h1>
              <div className="flex gap-4">
                <SignUpButton mode="modal">
                  <button className="bg-white text-black font-normal py-2 w-32 rounded-sm shadow-md">
                    sign up
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="bg-white text-black font-normal py-2 w-32 rounded-sm shadow-md">
                    log in
                  </button>
                </SignInButton>
              </div>
            </div>
            <div className="flex flex-col bg-white min-h-screen justify-center items-center px-16">
              {/* <Image
                src="/plant1stage1new.png"
                alt="Plant"
                width={500}
                height={700}
              /> */}
              <PlantUpdate />
            </div>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
