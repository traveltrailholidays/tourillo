import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

const PaymentsAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <div className={`flex flex-col gap-5`}>
        <AccordionItem value="item-1" className={`border-none`}>
          <AccordionTrigger
            className={`hover:no-underline bg-foreground px-5 rounded cursor-pointer transition-all duration-75`}
          >
            Pay in Account
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded border-border">
              <div className={`p-12`}>
                <div className={`text-violet-600 dark:text-violet-400 font-semibold text-[18px]`}>
                  <span>Pay the amount in below given account:</span>
                </div>
                <div className={`text-[17px] mt-5 flex flex-col gap-2`}>
                  <div>
                    <span className={`font-[500]`}>Bank Name: </span>
                    <span>IndusInd Bank</span>
                  </div>
                  <div>
                    <span className={`font-[500]`}>Account No: </span>
                    <span>259625992025</span>
                  </div>
                  <div>
                    <span className={`font-[500]`}>Account Name: </span>
                    <span>Tourillo Pvt Ltd. Private Limited</span>
                  </div>
                  <div>
                    <span className={`font-[500]`}>IFSC Code: </span>
                    <span>INDB0000735</span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className={`border-none`}>
          <AccordionTrigger
            className={`hover:no-underline bg-foreground px-5 rounded cursor-pointer transition-all duration-75`}
          >
            Scan & Pay
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded border-border">
              <div className={`p-12 flex flex-col gap-5`}>
                <div className={`text-violet-600 dark:text-violet-400 font-semibold text-[18px]`}>
                  <span>Scan to pay with any BHIM UPI App:</span>
                </div>
                <Image src={'/images/payment/upi.webp'} alt="" width={200} height={200} quality={100} />
                <div className="flex flex-col gap-2 text-[16px] font-semibold">
                  <span>Merchant: Tourillo Pvt Ltd.</span>
                  <span>UPI ID: 9625992025@upi</span>
                </div>
                <Image
                  src={'/images/payment/pay.webp'}
                  alt=""
                  width={250}
                  height={250}
                  quality={100}
                  className=" bg-blend-exclusion"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className={`border-none`}>
          <AccordionTrigger
            className={`hover:no-underline bg-foreground px-5 rounded cursor-pointer transition-all duration-75`}
          >
            Payment Gateway
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 border-[0.125rem] rounded border-border">
              <div className={`p-12`}>
                <div className={`text-violet-600 dark:text-violet-400 font-semibold text-[18px]`}>
                  <span>Fill the below details and proceed for the payment:</span>
                </div>
                <form className={`text-[17px] mt-5 flex flex-col gap-2`}>
                  <input
                    type="number"
                    name="amount"
                    className="border rounded p-3 focus:outline-none"
                    placeholder="Amount"
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    className="border rounded p-3 focus:outline-none"
                    placeholder="Name"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    className="border rounded p-3 focus:outline-none"
                    placeholder="Email"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    className="border rounded p-3 focus:outline-none"
                    placeholder="Phone No"
                  />
                  <textarea
                    name="paymentDetails"
                    className="border rounded p-3 focus:outline-none min-h-[140px] resize-none"
                    placeholder="Payment Details"
                    required
                  />
                  <div className="w-full flex justify-end">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-3 py-[7px] rounded-xs cursor-pointer font-semibold text-white lg:flex items-center justify-center gap-2 mt-3"
                    >
                      Pay Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
};

export default PaymentsAccordion;
